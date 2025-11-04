#!/bin/bash

# 🔄 MineContext LLM 切换脚本
# 用途：快速在 Ollama 和 SiliconFlow 之间切换

set -e

CONFIG_FILE="/Users/ruiwang/Desktop/killer app/MineContext-main/config/user_setting.yaml"
BACKUP_FILE="/Users/ruiwang/Desktop/killer app/MineContext-main/config/user_setting.yaml.backup"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║          MineContext LLM 配置切换工具                   ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 备份当前配置
backup_config() {
    if [ ! -f "$BACKUP_FILE" ]; then
        cp "$CONFIG_FILE" "$BACKUP_FILE"
        print_success "已备份当前配置到: user_setting.yaml.backup"
    fi
}

# 显示当前配置
show_status() {
    print_header
    echo "📋 当前配置:"
    echo ""
    
    if grep -q "localhost:11434" "$CONFIG_FILE"; then
        echo -e "  LLM 提供商: ${GREEN}Ollama (本地)${NC}"
        model=$(grep -A 5 "vlm_model:" "$CONFIG_FILE" | grep "model:" | head -1 | awk '{print $2}')
        echo "  LLM 模型: $model"
    else
        echo -e "  LLM 提供商: ${BLUE}SiliconFlow (API)${NC}"
        model=$(grep -A 5 "vlm_model:" "$CONFIG_FILE" | grep "model:" | head -1 | awk '{print $2}')
        echo "  LLM 模型: $model"
    fi
    
    if grep -A 10 "embedding_model:" "$CONFIG_FILE" | grep -q "localhost:11434"; then
        echo -e "  Embedding: ${GREEN}Ollama (本地)${NC}"
    else
        echo -e "  Embedding: ${BLUE}SiliconFlow (API)${NC}"
    fi
    echo ""
}

# 切换到 Ollama
switch_to_ollama() {
    local model=${1:-"qwen2.5:7b"}
    
    print_header
    print_info "正在切换到 Ollama 本地模型..."
    
    # 检查 Ollama 是否运行
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_error "Ollama 服务未运行！"
        echo ""
        echo "请先启动 Ollama:"
        echo "  nohup ollama serve > /tmp/ollama.log 2>&1 &"
        echo ""
        exit 1
    fi
    
    # 检查模型是否已下载
    if ! ollama list | grep -q "$model"; then
        print_warning "模型 $model 未下载"
        echo ""
        read -p "是否现在下载？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "正在下载模型 $model ..."
            ollama pull "$model"
            print_success "模型下载完成"
        else
            print_error "需要先下载模型才能使用"
            exit 1
        fi
    fi
    
    backup_config
    
    # 修改配置文件
    cat > "$CONFIG_FILE" << EOF
vlm_model:
  base_url: http://localhost:11434/v1
  api_key: ollama
  model: $model
  provider: openai
  timeout: 60
embedding_model:
  base_url: https://api.siliconflow.cn/v1
  api_key: sk-ettvkihjbklwxnyswvldjmkbvbphxcrqaqgyjxtyqfqkvkfs
  model: BAAI/bge-large-zh-v1.5
  provider: openai
  output_dim: 2048
EOF
    
    print_success "已切换到 Ollama 本地模型: $model"
    echo ""
    print_info "配置详情:"
    echo "  • LLM: Ollama ($model) - 本地推理"
    echo "  • Embedding: SiliconFlow - API"
    echo "  • 预期速度: 3-10秒（比 API 快 3-6倍）"
    echo ""
    print_warning "请重启 MineContext 服务:"
    echo "  cd '/Users/ruiwang/Desktop/killer app'"
    echo "  source MineContext_Commands.sh"
    echo "  restart"
    echo ""
}

# 切换到 SiliconFlow
switch_to_siliconflow() {
    print_header
    print_info "正在切换到 SiliconFlow API..."
    
    backup_config
    
    # 修改配置文件
    cat > "$CONFIG_FILE" << EOF
vlm_model:
  base_url: https://api.siliconflow.cn/v1
  api_key: sk-ettvkihjbklwxnyswvldjmkbvbphxcrqaqgyjxtyqfqkvkfs
  model: Qwen/Qwen2.5-7B-Instruct
  provider: openai
  timeout: 120
embedding_model:
  base_url: https://api.siliconflow.cn/v1
  api_key: sk-ettvkihjbklwxnyswvldjmkbvbphxcrqaqgyjxtyqfqkvkfs
  model: BAAI/bge-large-zh-v1.5
  provider: openai
  output_dim: 2048
EOF
    
    print_success "已切换到 SiliconFlow API"
    echo ""
    print_info "配置详情:"
    echo "  • LLM: SiliconFlow (Qwen2.5-7B) - API"
    echo "  • Embedding: SiliconFlow - API"
    echo "  • 预期速度: 30-60秒（依赖网络）"
    echo ""
    print_warning "请重启 MineContext 服务:"
    echo "  cd '/Users/ruiwang/Desktop/killer app'"
    echo "  source MineContext_Commands.sh"
    echo "  restart"
    echo ""
}

# 恢复备份
restore_backup() {
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "未找到备份文件"
        exit 1
    fi
    
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    print_success "已恢复到备份配置"
}

# 显示帮助
show_help() {
    print_header
    echo "用法:"
    echo "  $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  ollama [model]     - 切换到 Ollama 本地模型（默认: qwen2.5:7b）"
    echo "  siliconflow        - 切换到 SiliconFlow API"
    echo "  status             - 显示当前配置"
    echo "  restore            - 恢复备份配置"
    echo "  help               - 显示此帮助"
    echo ""
    echo "示例:"
    echo "  $0 ollama qwen2.5:7b      # 使用 Ollama qwen2.5:7b"
    echo "  $0 ollama llama3.2:3b     # 使用 Ollama llama3.2:3b"
    echo "  $0 siliconflow            # 切换回 SiliconFlow API"
    echo "  $0 status                 # 查看当前配置"
    echo ""
    echo "推荐 Ollama 模型:"
    echo "  • qwen2.5:7b      - 平衡性能和质量（推荐）"
    echo "  • qwen2.5:1.5b    - 最快速度"
    echo "  • llama3.2:3b     - Meta 出品，质量好"
    echo "  • gemma2:2b       - Google 出品，轻量级"
    echo ""
}

# 主逻辑
main() {
    case "${1:-help}" in
        ollama)
            switch_to_ollama "${2:-qwen2.5:7b}"
            ;;
        siliconflow)
            switch_to_siliconflow
            ;;
        status)
            show_status
            ;;
        restore)
            restore_backup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"

