const axios = require('axios');
const fs = require('fs');

// 获取当前时间与过期时间的时间差，进行倒计时
const getExpirationTime = (expiresAt) => {
  const expiresAtDate = new Date(expiresAt);
  const now = new Date();
  return expiresAtDate - now;
};

// 读取 walletAddress.txt 文件中的钱包地址
const getWalletAddress = () => {
  try {
    const data = fs.readFileSync('walletAddress.txt', 'utf8');
    return data.trim();
  } catch (err) {
    console.error('读取 walletAddress.txt 文件失败:', err);
    return null;
  }
};

// 随机生成一个 user-agent
const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:56.0) Gecko/20100101 Firefox/56.0',
    'Mozilla/5.0 (Linux; Android 9; Pixel 2 Build/PQ3A.190801.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const checkActivation = async () => {
  const walletAddress = getWalletAddress();
  if (!walletAddress) {
    console.log("钱包地址未找到，请确保 walletAddress.txt 文件存在并包含有效的地址。");
    return;
  }

  const url = "https://prior-stake-priorprotocol.replit.app/api/activate";
  const payload = {
    walletAddress,
    hasNFT: true
  };
  const headers = {
    'accept': '*/*',
    'accept-language': 'zh-CN,zh;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://priornftstake.xyz',
    'priority': 'u=1, i',
    'referer': 'https://priornftstake.xyz/',
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': getRandomUserAgent()
  };

  try {
    const response = await axios.post(url, payload, { headers });
    const data = response.data;

    if (data.alreadyActive) {
      console.log("nft已激活");
      const expiresAt = data.activation.expiresAt;
      const waitTime = getExpirationTime(expiresAt);

      if (waitTime > 0) {
        const countdown = setInterval(() => {
          const currentTime = new Date();
          const remainingTime = getExpirationTime(expiresAt);

          if (remainingTime <= 0) {
            console.log("激活时间已过期，重新激活。");
            clearInterval(countdown);
            checkActivation();  // 时间到，重新激活
          } else {
            // 清除现有页面内容并更新倒计时
            console.clear();
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            console.log(`下次激活时间：${new Date(expiresAt)}\n当前倒计时：${hours}:${minutes}:${seconds}`);
          }
        }, 1000);
      } else {
        console.log("激活时间已过期，重新激活。");
        checkActivation();
      }
    } else {
      console.log("激活失败或未激活。");
    }
  } catch (error) {
    console.error("请求失败", error);
  }
};

checkActivation();
