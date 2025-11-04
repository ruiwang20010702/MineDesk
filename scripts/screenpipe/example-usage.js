#!/usr/bin/env node

/**
 * Screenpipe Integration - Real-world Usage Example
 * 
 * 这个示例展示了如何构建一个 AI 助手，利用 Screenpipe 提供上下文感知能力
 */

const screenpipe = require('./screenpipe-integration');

/**
 * 构建上下文感知的 AI 提示
 * @param {string} userQuery - 用户的查询
 * @returns {Promise<string>} 增强后的提示
 */
async function buildContextAwarePrompt(userQuery) {
  console.log('\n🧠 Building context-aware AI prompt...\n');

  // 获取最近1小时的用户活动
  const recentActivity = await screenpipe.getRecentActivity(1, 20);

  // 提取关键上下文信息
  const context = {
    apps: new Set(),
    windows: new Set(),
    urls: new Set(),
    textSamples: []
  };

  recentActivity.forEach(item => {
    if (item.content) {
      if (item.content.app_name) context.apps.add(item.content.app_name);
      if (item.content.window_name) context.windows.add(item.content.window_name);
      if (item.content.browser_url) context.urls.add(item.content.browser_url);
      
      if (item.content.text && item.content.text.length > 20) {
        context.textSamples.push({
          timestamp: item.timestamp,
          text: item.content.text.substring(0, 200),
          app: item.content.app_name
        });
      }
    }
  });

  // 构建增强提示
  let enhancedPrompt = `User Query: ${userQuery}\n\n`;
  
  enhancedPrompt += `## User Context (Last 1 Hour)\n\n`;
  
  if (context.apps.size > 0) {
    enhancedPrompt += `### Active Applications:\n`;
    context.apps.forEach(app => enhancedPrompt += `- ${app}\n`);
    enhancedPrompt += `\n`;
  }

  if (context.urls.size > 0) {
    enhancedPrompt += `### Visited URLs:\n`;
    Array.from(context.urls).slice(0, 5).forEach(url => {
      enhancedPrompt += `- ${url}\n`;
    });
    enhancedPrompt += `\n`;
  }

  if (context.textSamples.length > 0) {
    enhancedPrompt += `### Recent Screen Text:\n`;
    context.textSamples.slice(0, 3).forEach((sample, i) => {
      enhancedPrompt += `\n${i + 1}. ${new Date(sample.timestamp).toLocaleTimeString()} (${sample.app}):\n`;
      enhancedPrompt += `   ${sample.text}\n`;
    });
  }

  return enhancedPrompt;
}

/**
 * 智能工作总结
 * @param {number} hours - 总结最近几小时的工作
 */
async function generateWorkSummary(hours = 8) {
  console.log(`\n📝 Generating work summary for the last ${hours} hours...\n`);

  const activity = await screenpipe.getRecentActivity(hours, 100);

  const summary = {
    totalActivities: activity.length,
    apps: {},
    urls: [],
    textContent: [],
    audioTranscripts: []
  };

  // 分析活动数据
  activity.forEach(item => {
    if (item.type === 'OCR' && item.content) {
      // 统计应用使用时间
      const app = item.content.app_name || 'Unknown';
      summary.apps[app] = (summary.apps[app] || 0) + 1;

      // 收集 URL
      if (item.content.browser_url && !summary.urls.includes(item.content.browser_url)) {
        summary.urls.push(item.content.browser_url);
      }

      // 收集有价值的文本
      if (item.content.text && item.content.text.length > 50) {
        summary.textContent.push({
          timestamp: item.timestamp,
          app: app,
          text: item.content.text.substring(0, 300)
        });
      }
    }

    if (item.type === 'Audio' && item.content?.transcription) {
      summary.audioTranscripts.push({
        timestamp: item.timestamp,
        text: item.content.transcription
      });
    }
  });

  // 打印总结
  console.log('## Work Summary\n');
  console.log(`Total activities tracked: ${summary.totalActivities}\n`);

  console.log('### Top Applications:');
  Object.entries(summary.apps)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([app, count]) => {
      console.log(`  - ${app}: ${count} activities`);
    });

  if (summary.urls.length > 0) {
    console.log('\n### Websites Visited:');
    summary.urls.slice(0, 5).forEach(url => {
      console.log(`  - ${url}`);
    });
  }

  if (summary.audioTranscripts.length > 0) {
    console.log(`\n### Audio Transcripts: ${summary.audioTranscripts.length} segments captured`);
  }

  return summary;
}

/**
 * 搜索相关工作记录
 * @param {string} topic - 主题关键词
 */
async function searchWorkHistory(topic) {
  console.log(`\n🔍 Searching work history for: "${topic}"\n`);

  // 并行搜索 OCR 和音频内容
  const [ocrResults, audioResults] = await Promise.all([
    screenpipe.searchOCRContent(topic, 72), // 搜索最近3天
    screenpipe.searchAudioTranscripts(topic, 72)
  ]);

  console.log(`Found ${ocrResults.length} OCR matches and ${audioResults.length} audio matches\n`);

  if (ocrResults.length > 0) {
    console.log('### Screen Content Matches:');
    ocrResults.slice(0, 3).forEach((result, i) => {
      console.log(`\n${i + 1}. ${new Date(result.timestamp).toLocaleString()}`);
      console.log(`   App: ${result.content?.app_name || 'Unknown'}`);
      if (result.content?.text) {
        console.log(`   Text: ${result.content.text.substring(0, 150)}...`);
      }
    });
  }

  if (audioResults.length > 0) {
    console.log('\n### Audio Transcript Matches:');
    audioResults.slice(0, 3).forEach((result, i) => {
      console.log(`\n${i + 1}. ${new Date(result.timestamp).toLocaleString()}`);
      if (result.content?.transcription) {
        console.log(`   Transcript: ${result.content.transcription.substring(0, 150)}...`);
      }
    });
  }

  return { ocrResults, audioResults };
}

/**
 * 主演示函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // 检查 Screenpipe 是否运行
  const isRunning = await screenpipe.isScreenpipeRunning();
  if (!isRunning) {
    console.log('⚠️ Screenpipe is not running. Please start it first:');
    console.log('   screenpipe\n');
    process.exit(1);
  }

  console.log('✅ Connected to Screenpipe\n');

  switch (command) {
    case 'context':
      // 构建上下文感知提示
      const query = args.slice(1).join(' ') || 'What should I work on next?';
      const prompt = await buildContextAwarePrompt(query);
      console.log('\n📋 Enhanced Prompt:\n');
      console.log('='.repeat(60));
      console.log(prompt);
      console.log('='.repeat(60));
      break;

    case 'summary':
      // 生成工作总结
      const hours = parseInt(args[1]) || 8;
      await generateWorkSummary(hours);
      break;

    case 'search':
      // 搜索工作历史
      const topic = args.slice(1).join(' ') || 'project';
      await searchWorkHistory(topic);
      break;

    default:
      console.log('📚 Screenpipe Integration - Usage Examples\n');
      console.log('Commands:');
      console.log('  node example-usage.js context [query]   - Build context-aware AI prompt');
      console.log('  node example-usage.js summary [hours]   - Generate work summary');
      console.log('  node example-usage.js search [topic]    - Search work history');
      console.log('\nExamples:');
      console.log('  node example-usage.js context "Help me write an email"');
      console.log('  node example-usage.js summary 4');
      console.log('  node example-usage.js search "API design"\n');
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  buildContextAwarePrompt,
  generateWorkSummary,
  searchWorkHistory
};

