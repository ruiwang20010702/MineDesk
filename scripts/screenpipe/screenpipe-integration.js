#!/usr/bin/env node

/**
 * Screenpipe Integration for Context-Aware AI
 * 
 * 这个脚本连接到 Screenpipe API 来获取用户的屏幕和音频历史记录
 */

const http = require('http');
const { exec } = require('child_process');

// Screenpipe API 配置
const SCREENPIPE_API = {
  host: 'localhost',
  port: 3030, // Screenpipe 默认端口
  timeout: 10000
};

/**
 * 查询 Screenpipe API
 * @param {string} endpoint - API endpoint
 * @param {string} query - Query parameters
 * @returns {Promise<Object>} API response
 */
async function queryScreenpipe(endpoint, query = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SCREENPIPE_API.host,
      port: SCREENPIPE_API.port,
      path: `${endpoint}${query}`,
      method: 'GET',
      timeout: SCREENPIPE_API.timeout
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * 获取最近的屏幕/音频活动
 * @param {number} hours - 查询最近几小时的数据
 * @param {number} limit - 返回结果数量限制
 * @returns {Promise<Array>} Activity data
 */
async function getRecentActivity(hours = 3, limit = 50) {
  try {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const query = `?limit=${limit}&start_time=${startTime.toISOString()}&end_time=${now.toISOString()}`;
    
    const response = await queryScreenpipe('/search', query);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error.message);
    return [];
  }
}

/**
 * 搜索 OCR 文本内容
 * @param {string} searchText - 要搜索的文本
 * @param {number} hours - 时间范围（小时）
 * @returns {Promise<Array>} Search results
 */
async function searchOCRContent(searchText, hours = 24) {
  try {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const query = `?q=${encodeURIComponent(searchText)}&limit=20&content_type=ocr&start_time=${startTime.toISOString()}`;
    
    const response = await queryScreenpipe('/search', query);
    return response.data || [];
  } catch (error) {
    console.error('Error searching OCR content:', error.message);
    return [];
  }
}

/**
 * 搜索音频转录内容
 * @param {string} searchText - 要搜索的文本
 * @param {number} hours - 时间范围（小时）
 * @returns {Promise<Array>} Search results
 */
async function searchAudioTranscripts(searchText, hours = 24) {
  try {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const query = `?q=${encodeURIComponent(searchText)}&limit=20&content_type=audio&start_time=${startTime.toISOString()}`;
    
    const response = await queryScreenpipe('/search', query);
    return response.data || [];
  } catch (error) {
    console.error('Error searching audio transcripts:', error.message);
    return [];
  }
}

/**
 * 检查 Screenpipe 是否正在运行
 * @returns {Promise<boolean>}
 */
async function isScreenpipeRunning() {
  try {
    await queryScreenpipe('/health');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 启动 Screenpipe 服务
 * @returns {Promise<void>}
 */
function startScreenpipe() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Screenpipe...');
    
    const screenpipe = exec('screenpipe', (error) => {
      if (error) {
        console.error('Error starting Screenpipe:', error);
        reject(error);
      }
    });

    screenpipe.stdout.on('data', (data) => {
      console.log(`[Screenpipe] ${data.toString().trim()}`);
      
      // 检测服务已启动
      if (data.includes('Server running') || data.includes('listening on')) {
        console.log('✅ Screenpipe started successfully!');
        resolve();
      }
    });

    screenpipe.stderr.on('data', (data) => {
      console.error(`[Screenpipe Error] ${data.toString().trim()}`);
    });

    // 5秒后超时
    setTimeout(() => {
      console.log('⚠️ Screenpipe may be starting in the background...');
      resolve();
    }, 5000);
  });
}

/**
 * 主函数 - 演示用法
 */
async function main() {
  console.log('🔍 Screenpipe Integration Demo\n');

  // 检查 Screenpipe 是否运行
  const running = await isScreenpipeRunning();
  
  if (!running) {
    console.log('⚠️ Screenpipe is not running. Starting it now...\n');
    await startScreenpipe();
    
    // 等待服务完全启动
    await new Promise(resolve => setTimeout(resolve, 3000));
  } else {
    console.log('✅ Screenpipe is already running\n');
  }

  // 示例 1: 获取最近3小时的活动
  console.log('📊 Fetching recent activity (last 3 hours)...');
  const activity = await getRecentActivity(3, 10);
  console.log(`Found ${activity.length} activities`);
  
  if (activity.length > 0) {
    console.log('\nSample activity:');
    activity.slice(0, 2).forEach((item, i) => {
      console.log(`\n[${i + 1}] ${item.type} - ${new Date(item.timestamp).toLocaleString()}`);
      if (item.content?.text) {
        console.log(`  Text: ${item.content.text.substring(0, 100)}...`);
      }
      if (item.content?.app_name) {
        console.log(`  App: ${item.content.app_name}`);
      }
    });
  }

  // 示例 2: 搜索 OCR 内容
  console.log('\n\n🔎 Searching for OCR content containing "code"...');
  const ocrResults = await searchOCRContent('code', 24);
  console.log(`Found ${ocrResults.length} OCR results`);

  // 示例 3: 搜索音频内容
  console.log('\n🎤 Searching for audio transcripts containing "meeting"...');
  const audioResults = await searchAudioTranscripts('meeting', 24);
  console.log(`Found ${audioResults.length} audio results`);

  console.log('\n✨ Demo completed!');
  console.log('\n💡 You can now integrate these functions into your AI app.');
  console.log('   - Use getRecentActivity() for contextual awareness');
  console.log('   - Use searchOCRContent() to find specific screen content');
  console.log('   - Use searchAudioTranscripts() to search meeting notes');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

// 导出函数供其他模块使用
module.exports = {
  queryScreenpipe,
  getRecentActivity,
  searchOCRContent,
  searchAudioTranscripts,
  isScreenpipeRunning,
  startScreenpipe
};

