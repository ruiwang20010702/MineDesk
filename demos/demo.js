#!/usr/bin/env node

/**
 * Screenpipe 集成 - 完整演示
 * 
 * 这个脚本展示 Screenpipe 如何为 AI 应用提供上下文感知能力
 */

const screenpipe = require('./screenpipe-integration');
const readline = require('readline');

// 模拟 AI 响应（实际应该调用 OpenAI/Claude 等）
function simulateAI(prompt) {
  return `[AI Response]
Based on your recent activity, I can see you've been working with:
${prompt}

I recommend focusing on...
(This would be a real AI response in production)`;
}

// 交互式命令行界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// 演示场景
const demos = {
  '1': {
    name: '🎯 上下文感知 AI 提示',
    description: '展示如何为 AI 自动添加用户工作上下文',
    async run() {
      console.log('\n' + '='.repeat(60));
      console.log('场景: 你想问 AI 一个编程问题');
      console.log('='.repeat(60) + '\n');

      const userQuery = await question('请输入你的问题（或按回车使用示例）: ') 
        || 'How should I structure my API endpoints?';

      console.log('\n⏳ 正在收集你的工作上下文...\n');

      const activity = await screenpipe.getRecentActivity(1, 20);
      
      console.log(`📊 找到 ${activity.length} 条最近活动\n`);

      // 构建上下文
      const apps = new Set();
      const urls = new Set();
      
      activity.forEach(item => {
        if (item.content?.app_name) apps.add(item.content.app_name);
        if (item.content?.browser_url) urls.add(item.content.browser_url);
      });

      console.log('📱 你最近使用的应用:');
      Array.from(apps).slice(0, 5).forEach(app => console.log(`   - ${app}`));

      if (urls.size > 0) {
        console.log('\n🌐 你最近访问的网站:');
        Array.from(urls).slice(0, 3).forEach(url => {
          console.log(`   - ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`);
        });
      }

      console.log('\n🤖 发送给 AI 的增强提示:');
      console.log('-'.repeat(60));
      
      const enhancedPrompt = `
Context:
- Recent apps: ${Array.from(apps).join(', ')}
- Recent URLs: ${Array.from(urls).slice(0, 2).join(', ')}

User Question: ${userQuery}
      `.trim();

      console.log(enhancedPrompt);
      console.log('-'.repeat(60));

      console.log('\n💡 这样 AI 就知道你的工作环境，能给出更准确的建议！\n');
    }
  },

  '2': {
    name: '📝 智能工作总结',
    description: '自动生成过去几小时的工作报告',
    async run() {
      console.log('\n' + '='.repeat(60));
      console.log('场景: 下班前快速生成今天的工作总结');
      console.log('='.repeat(60) + '\n');

      const hours = parseInt(await question('总结最近几小时的工作？(默认 4): ') || '4');

      console.log(`\n⏳ 正在分析最近 ${hours} 小时的活动...\n`);

      const activity = await screenpipe.getRecentActivity(hours, 200);

      if (activity.length === 0) {
        console.log('⚠️  没有找到活动记录。请确保 Screenpipe 正在运行。\n');
        return;
      }

      // 统计数据
      const stats = {
        apps: {},
        urls: [],
        textSamples: []
      };

      activity.forEach(item => {
        if (item.content) {
          const app = item.content.app_name || 'Unknown';
          stats.apps[app] = (stats.apps[app] || 0) + 1;

          if (item.content.browser_url && !stats.urls.includes(item.content.browser_url)) {
            stats.urls.push(item.content.browser_url);
          }

          if (item.content.text && item.content.text.length > 50) {
            stats.textSamples.push({
              time: new Date(item.timestamp).toLocaleTimeString(),
              text: item.content.text.substring(0, 150)
            });
          }
        }
      });

      // 显示总结
      console.log('## 📊 工作总结\n');
      console.log(`总活动数: ${activity.length} 条记录\n`);

      console.log('### 🏆 最常用应用:');
      Object.entries(stats.apps)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([app, count]) => {
          const percentage = ((count / activity.length) * 100).toFixed(1);
          console.log(`   ${app.padEnd(25)} ${count} 次 (${percentage}%)`);
        });

      if (stats.urls.length > 0) {
        console.log('\n### 🌐 访问的网站:');
        stats.urls.slice(0, 5).forEach((url, i) => {
          console.log(`   ${i + 1}. ${url.substring(0, 70)}${url.length > 70 ? '...' : ''}`);
        });
      }

      if (stats.textSamples.length > 0) {
        console.log('\n### 📝 工作片段:');
        stats.textSamples.slice(0, 3).forEach((sample, i) => {
          console.log(`\n   [${sample.time}]`);
          console.log(`   ${sample.text}...`);
        });
      }

      console.log('\n💾 这份总结可以自动保存或发送给 AI 生成更详细的报告\n');
    }
  },

  '3': {
    name: '🔍 搜索工作历史',
    description: '在过去的屏幕和音频中搜索特定内容',
    async run() {
      console.log('\n' + '='.repeat(60));
      console.log('场景: 你记得上周讨论过某个话题，但忘了具体内容');
      console.log('='.repeat(60) + '\n');

      const searchTerm = await question('搜索什么内容？(或按回车使用 "API"): ') || 'API';
      const hours = parseInt(await question('搜索最近多少小时？(默认 24): ') || '24');

      console.log(`\n🔍 正在搜索 "${searchTerm}" (最近 ${hours} 小时)...\n`);

      // 并行搜索 OCR 和音频
      const [ocrResults, audioResults] = await Promise.all([
        screenpipe.searchOCRContent(searchTerm, hours),
        screenpipe.searchAudioTranscripts(searchTerm, hours)
      ]);

      console.log(`找到 ${ocrResults.length} 条屏幕记录，${audioResults.length} 条音频记录\n`);

      if (ocrResults.length > 0) {
        console.log('### 📺 屏幕内容匹配:\n');
        ocrResults.slice(0, 3).forEach((result, i) => {
          console.log(`${i + 1}. ${new Date(result.timestamp).toLocaleString()}`);
          console.log(`   应用: ${result.content?.app_name || 'Unknown'}`);
          if (result.content?.window_name) {
            console.log(`   窗口: ${result.content.window_name}`);
          }
          if (result.content?.text) {
            const text = result.content.text.replace(/\n/g, ' ').substring(0, 120);
            console.log(`   内容: ${text}...`);
          }
          console.log('');
        });
      }

      if (audioResults.length > 0) {
        console.log('### 🎤 音频转录匹配:\n');
        audioResults.slice(0, 3).forEach((result, i) => {
          console.log(`${i + 1}. ${new Date(result.timestamp).toLocaleString()}`);
          if (result.content?.transcription) {
            const text = result.content.transcription.substring(0, 150);
            console.log(`   转录: ${text}...`);
          }
          console.log('');
        });
      }

      if (ocrResults.length === 0 && audioResults.length === 0) {
        console.log('😔 没有找到匹配的内容');
        console.log('   提示: 确保 Screenpipe 已运行一段时间来收集数据\n');
      } else {
        console.log('💡 找到了！AI 可以基于这些历史记录给你更准确的回答\n');
      }
    }
  },

  '4': {
    name: '📊 查看 Screenpipe 状态',
    description: '检查 Screenpipe 运行状态和数据统计',
    async run() {
      console.log('\n' + '='.repeat(60));
      console.log('Screenpipe 系统状态');
      console.log('='.repeat(60) + '\n');

      // 检查运行状态
      const isRunning = await screenpipe.isScreenpipeRunning();
      
      if (!isRunning) {
        console.log('❌ Screenpipe 未运行\n');
        console.log('启动命令: ./start-screenpipe.sh\n');
        return;
      }

      console.log('✅ Screenpipe 正在运行\n');

      // 获取数据统计
      const recent = await screenpipe.getRecentActivity(1, 100);
      const day = await screenpipe.getRecentActivity(24, 1000);

      console.log('📈 数据统计:\n');
      console.log(`   最近 1 小时: ${recent.length} 条活动`);
      console.log(`   最近 24 小时: ${day.length} 条活动`);
      console.log(`   估计录制率: ${Math.round(day.length / 24)} 条/小时\n`);

      // 应用统计
      if (day.length > 0) {
        const apps = {};
        day.forEach(item => {
          const app = item.content?.app_name || 'Unknown';
          apps[app] = (apps[app] || 0) + 1;
        });

        console.log('🏆 今日最常用应用:\n');
        Object.entries(apps)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .forEach(([app, count], i) => {
            console.log(`   ${i + 1}. ${app}: ${count} 次`);
          });
      }

      console.log('\n💾 数据存储:\n');
      console.log('   数据库: ~/.screenpipe/db.sqlite');
      console.log('   日志: ~/.screenpipe/screenpipe.log');
      console.log('   API: http://localhost:3030\n');

      console.log('🔧 管理命令:\n');
      console.log('   查看日志: tail -f ~/.screenpipe/screenpipe.log');
      console.log('   停止服务: pkill screenpipe');
      console.log('   查询数据库: sqlite3 ~/.screenpipe/db.sqlite\n');
    }
  }
};

async function showMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('🎬 Screenpipe Integration Demo');
  console.log('='.repeat(60) + '\n');

  console.log('请选择演示场景:\n');
  Object.entries(demos).forEach(([key, demo]) => {
    console.log(`  ${key}. ${demo.name}`);
    console.log(`     ${demo.description}\n`);
  });

  console.log('  0. 退出\n');

  const choice = await question('请选择 (0-4): ');

  if (choice === '0') {
    console.log('\n👋 再见！\n');
    rl.close();
    return false;
  }

  const demo = demos[choice];
  if (!demo) {
    console.log('\n❌ 无效选择\n');
    return true;
  }

  try {
    await demo.run();
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 提示: Screenpipe 似乎没有运行');
      console.log('   请先运行: ./start-screenpipe.sh\n');
    }
  }

  await question('\n按回车继续...');
  return true;
}

async function main() {
  console.clear();
  
  // 检查 Screenpipe 是否运行
  const isRunning = await screenpipe.isScreenpipeRunning();
  
  if (!isRunning) {
    console.log('\n⚠️  警告: Screenpipe 未运行\n');
    console.log('某些演示需要 Screenpipe 运行。');
    console.log('启动命令: ./start-screenpipe.sh\n');
    
    const shouldContinue = await question('是否继续？(y/n): ');
    if (shouldContinue.toLowerCase() !== 'y') {
      console.log('\n👋 再见！\n');
      rl.close();
      return;
    }
  } else {
    console.log('\n✅ Screenpipe 已连接\n');
  }

  // 主循环
  let continueDemo = true;
  while (continueDemo) {
    continueDemo = await showMenu();
  }
}

// 启动演示
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 致命错误:', error);
    rl.close();
    process.exit(1);
  });
}

