/**
 * Screenpipe 完整演示脚本
 * 展示如何使用 Screenpipe API 进行数据查询和分析
 */

const axios = require('axios');

const SCREENPIPE_API = 'http://localhost:3030';

// ANSI 颜色代码
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
};

function log(emoji, title, content = '') {
    console.log(`\n${emoji} ${colors.bright}${title}${colors.reset}`);
    if (content) {
        console.log(content);
    }
}

function printBox(title) {
    const width = 70;
    const padding = Math.floor((width - title.length - 2) / 2);
    console.log('\n╔' + '═'.repeat(width) + '╗');
    console.log('║' + ' '.repeat(padding) + title + ' '.repeat(width - padding - title.length) + '║');
    console.log('╚' + '═'.repeat(width) + '╝\n');
}

async function checkHealth() {
    try {
        const response = await axios.get(`${SCREENPIPE_API}/health`);
        const health = response.data;
        
        log('🏥', '健康状态检查');
        console.log(`  总体状态: ${health.status === 'healthy' ? '✅' : '⚠️'} ${health.status}`);
        console.log(`  屏幕录制: ${health.frame_status === 'ok' ? '✅' : '❌'} ${health.frame_status}`);
        console.log(`  音频录制: ${health.audio_status === 'ok' ? '✅' : '❌'} ${health.audio_status}`);
        console.log(`  UI 监控: ${health.ui_status === 'disabled' ? '⏸️' : '✅'} ${health.ui_status}`);
        
        if (health.last_frame_timestamp) {
            const lastFrame = new Date(health.last_frame_timestamp);
            const secondsAgo = Math.floor((Date.now() - lastFrame.getTime()) / 1000);
            console.log(`  最后屏幕帧: ${secondsAgo} 秒前`);
        }
        
        if (health.last_audio_timestamp) {
            const lastAudio = new Date(health.last_audio_timestamp);
            const secondsAgo = Math.floor((Date.now() - lastAudio.getTime()) / 1000);
            console.log(`  最后音频: ${secondsAgo} 秒前`);
        }
        
        if (health.device_status_details) {
            console.log(`\n  设备详情: ${health.device_status_details}`);
        }
        
        return health;
    } catch (error) {
        console.error(`${colors.red}❌ 健康检查失败:${colors.reset}`, error.message);
        throw error;
    }
}

async function searchRecent(limit = 10) {
    try {
        log('🔍', '搜索最近的活动记录');
        
        // 获取最近 5 分钟的数据
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        const params = {
            start_time: fiveMinutesAgo.toISOString(),
            end_time: now.toISOString(),
            limit: limit,
            content_type: 'all'
        };
        
        console.log(`  时间范围: ${fiveMinutesAgo.toLocaleTimeString()} - ${now.toLocaleTimeString()}`);
        console.log(`  查询限制: ${limit} 条记录\n`);
        
        const response = await axios.get(`${SCREENPIPE_API}/search`, { params });
        const data = response.data;
        
        if (data.data && data.data.length > 0) {
            console.log(`  ${colors.green}✅ 找到 ${data.data.length} 条记录${colors.reset}\n`);
            
            // 显示前几条记录
            data.data.slice(0, 5).forEach((item, index) => {
                console.log(`  ${colors.cyan}[${index + 1}]${colors.reset} ${new Date(item.content.timestamp).toLocaleTimeString()}`);
                
                if (item.type === 'OCR' && item.content.text) {
                    const text = item.content.text.substring(0, 100);
                    console.log(`      📝 ${text}${item.content.text.length > 100 ? '...' : ''}`);
                }
                
                if (item.type === 'Audio' && item.content.transcription) {
                    const text = item.content.transcription.substring(0, 100);
                    console.log(`      🎤 ${text}${item.content.transcription.length > 100 ? '...' : ''}`);
                }
                
                if (item.content.app_name) {
                    console.log(`      📱 应用: ${item.content.app_name}`);
                }
                
                if (item.content.window_name) {
                    console.log(`      🪟 窗口: ${item.content.window_name}`);
                }
                
                console.log('');
            });
            
            return data;
        } else {
            console.log(`  ${colors.yellow}⚠️ 没有找到记录（可能需要等待几分钟让系统采集数据）${colors.reset}`);
            return null;
        }
    } catch (error) {
        console.error(`${colors.red}❌ 搜索失败:${colors.reset}`, error.message);
        if (error.response) {
            console.error('  响应数据:', error.response.data);
        }
        return null;
    }
}

async function searchByKeyword(keyword) {
    try {
        log('🔎', `搜索关键词: "${keyword}"`);
        
        // 搜索过去 1 小时的数据
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        const params = {
            q: keyword,
            start_time: oneHourAgo.toISOString(),
            end_time: now.toISOString(),
            limit: 20,
            content_type: 'all'
        };
        
        const response = await axios.get(`${SCREENPIPE_API}/search`, { params });
        const data = response.data;
        
        if (data.data && data.data.length > 0) {
            console.log(`  ${colors.green}✅ 找到 ${data.data.length} 条匹配记录${colors.reset}\n`);
            
            data.data.slice(0, 3).forEach((item, index) => {
                console.log(`  ${colors.cyan}[${index + 1}]${colors.reset} ${new Date(item.content.timestamp).toLocaleTimeString()}`);
                
                const text = item.content.text || item.content.transcription || '';
                if (text) {
                    // 高亮关键词
                    const highlighted = text.substring(0, 200).replace(
                        new RegExp(keyword, 'gi'),
                        `${colors.yellow}$&${colors.reset}`
                    );
                    console.log(`      ${highlighted}${text.length > 200 ? '...' : ''}`);
                }
                console.log('');
            });
            
            return data;
        } else {
            console.log(`  ${colors.yellow}⚠️ 没有找到包含 "${keyword}" 的记录${colors.reset}`);
            return null;
        }
    } catch (error) {
        console.error(`${colors.red}❌ 关键词搜索失败:${colors.reset}`, error.message);
        return null;
    }
}

async function getStatistics() {
    try {
        log('📊', '数据统计');
        
        // 获取今天的数据统计
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const params = {
            start_time: todayStart.toISOString(),
            end_time: now.toISOString(),
            limit: 1000,
            content_type: 'all'
        };
        
        const response = await axios.get(`${SCREENPIPE_API}/search`, { params });
        const data = response.data;
        
        if (data.data && data.data.length > 0) {
            // 统计不同类型的记录
            const stats = {
                ocr: 0,
                audio: 0,
                apps: new Set(),
                windows: new Set(),
                totalWords: 0
            };
            
            data.data.forEach(item => {
                if (item.type === 'OCR') {
                    stats.ocr++;
                    if (item.content.text) {
                        stats.totalWords += item.content.text.split(/\s+/).length;
                    }
                }
                if (item.type === 'Audio') {
                    stats.audio++;
                    if (item.content.transcription) {
                        stats.totalWords += item.content.transcription.split(/\s+/).length;
                    }
                }
                if (item.content.app_name) {
                    stats.apps.add(item.content.app_name);
                }
                if (item.content.window_name) {
                    stats.windows.add(item.content.window_name);
                }
            });
            
            console.log(`  总记录数: ${colors.green}${data.data.length}${colors.reset}`);
            console.log(`  屏幕记录: ${colors.cyan}${stats.ocr}${colors.reset}`);
            console.log(`  音频记录: ${colors.cyan}${stats.audio}${colors.reset}`);
            console.log(`  使用的应用: ${colors.cyan}${stats.apps.size}${colors.reset}`);
            console.log(`  打开的窗口: ${colors.cyan}${stats.windows.size}${colors.reset}`);
            console.log(`  总词数: ${colors.cyan}${stats.totalWords}${colors.reset}`);
            
            if (stats.apps.size > 0) {
                console.log(`\n  ${colors.bright}最常用的应用:${colors.reset}`);
                Array.from(stats.apps).slice(0, 5).forEach(app => {
                    console.log(`    • ${app}`);
                });
            }
            
            return stats;
        } else {
            console.log(`  ${colors.yellow}⚠️ 暂无统计数据${colors.reset}`);
            return null;
        }
    } catch (error) {
        console.error(`${colors.red}❌ 统计失败:${colors.reset}`, error.message);
        return null;
    }
}

async function demonstrateUseCases() {
    printBox('Screenpipe 使用场景演示');
    
    log('💡', '场景 1: 找到我最近在哪个应用工作');
    console.log('  用途: 追踪工作流程，生成时间日志');
    
    log('💡', '场景 2: 搜索特定关键词');
    console.log('  用途: 快速找到之前看过的内容或讨论');
    
    log('💡', '场景 3: 生成工作摘要');
    console.log('  用途: 自动生成周报、工作日志');
    
    log('💡', '场景 4: 知识管理');
    console.log('  用途: 自动记录和检索工作中的知识点');
    
    log('💡', '场景 5: 时间追踪');
    console.log('  用途: 自动统计在不同应用和任务上花费的时间');
}

async function main() {
    try {
        printBox('🚀 Screenpipe 演示开始');
        
        // 1. 健康检查
        const health = await checkHealth();
        
        if (health.status !== 'healthy' && health.frame_status !== 'ok') {
            console.log(`\n${colors.yellow}⚠️ 警告: Screenpipe 未完全就绪${colors.reset}`);
            console.log('请确保已配置屏幕录制权限并重启服务\n');
            return;
        }
        
        // 2. 搜索最近的活动
        await searchRecent(10);
        
        // 等待一下
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. 获取统计数据
        await getStatistics();
        
        // 等待一下
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 4. 关键词搜索示例
        console.log('\n' + '─'.repeat(70));
        log('🎯', '关键词搜索示例');
        console.log('  提示: 尝试搜索你最近使用过的词语\n');
        
        // 可以在这里添加自定义关键词搜索
        // await searchByKeyword('你的关键词');
        
        // 5. 使用场景演示
        console.log('\n' + '─'.repeat(70));
        await demonstrateUseCases();
        
        // 6. 完成
        printBox('✅ 演示完成');
        
        console.log(`${colors.green}🎉 Screenpipe 已成功运行！${colors.reset}\n`);
        console.log('下一步可以做什么：');
        console.log('  1. 查看实时日志: tail -f ~/.screenpipe/screenpipe.log');
        console.log('  2. 运行状态检查: bash scripts/screenpipe/check-screenpipe-status.sh');
        console.log('  3. 开发你的应用: 参考 docs/screenpipe/ 目录下的文档');
        console.log('  4. 自定义搜索: 编辑本脚本添加自己的查询');
        console.log('\n');
        
    } catch (error) {
        console.error(`\n${colors.red}❌ 演示过程中出错:${colors.reset}`, error.message);
        console.log('\n建议排查步骤：');
        console.log('  1. 确认 Screenpipe 正在运行: ps aux | grep screenpipe');
        console.log('  2. 检查 API 健康: curl http://localhost:3030/health');
        console.log('  3. 查看日志: tail -50 ~/.screenpipe/screenpipe.log');
        console.log('\n');
        process.exit(1);
    }
}

// 运行演示
if (require.main === module) {
    main();
}

module.exports = {
    checkHealth,
    searchRecent,
    searchByKeyword,
    getStatistics
};

