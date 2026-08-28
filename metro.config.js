const { getDefaultConfig } = require('expo/metro-config');

// เครื่อง multi-core ทำให้ Metro spawn worker ตามจำนวน core
// worker เยอะเกินไปทำให้ v8 serialize ผลลัพธ์กลับ main process ไม่ไหว (OOM ตอน bundle)
const MAX_METRO_WORKERS = 4;

const config = getDefaultConfig(__dirname);
config.maxWorkers = MAX_METRO_WORKERS;

module.exports = config;
