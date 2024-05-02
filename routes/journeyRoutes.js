const express = require("express");
const { exec } = require("child_process");

const axios = require("axios");
require("dotenv").config();
const router = express.Router();
const token = process.env.MIDJOURNEY_TOKEN;
const BASE_URL = "https://api.mymidjourney.ai/api/v1/midjourney";
const instance = axios.create({
  timeout: 0,
});

const checkProgress = async (messageId, token) => {
  try {
    const config = {
      method: "get",
      url: `${BASE_URL}/message/${messageId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await instance(config);
    return response.data;
  } catch (error) {
    console.error("Error in fetching progress:", error);
    throw error;
  }
};

router.post("/create2", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    const responses = [];
    const config = {
      method: "post",
      url: `${BASE_URL}/imagine`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        prompt: `${body.prompt}`,
      },
    };
    const response = await axios(config);
    const messageId = response.data.messageId;
    const response2 = await axios(config);
    const messageId2 = response2.data.messageId;
    console.log(messageId);
    console.log(messageId2);

    let completedIntervals = 0;

    const interval1 = setInterval(async () => {
      try {
        const progressResponse = await checkProgress(messageId, token);
        if (progressResponse.status === "DONE") {
          clearInterval(interval1);
          responses.push(progressResponse);
          completedIntervals++;
          if (completedIntervals === 2) {
            res.status(200).json(responses);
          }
        }
      } catch (error) {
        clearInterval(interval1);
        res.status(500).json({ error: "Error in checking progress" });
      }
    }, 3000);

    const interval2 = setInterval(async () => {
      try {
        const progressResponse = await checkProgress(messageId2, token);
        if (progressResponse.status === "DONE") {
          clearInterval(interval2);
          responses.push(progressResponse);
          completedIntervals++;
          if (completedIntervals === 2) {
            res.status(200).json(responses);
          }
        }
      } catch (error) {
        clearInterval(interval2);
        res.status(500).json({ error: "Error in checking progress" });
      }
    }, 3000);
  } catch (error) {
    console.error("Error in generation request:", error);
    res.status(500).json({ error: "Error in your response request" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    const config = {
      method: "post",
      url: `${BASE_URL}/imagine`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        prompt: `${body.prompt}`,
      },
    };
    const response = await axios(config);
    const messageId = response.data.messageId;
    console.log(messageId);

    const interval = setInterval(async () => {
      try {
        const progressResponse = await checkProgress(messageId, token);
        if (progressResponse.status === "DONE") {
          clearInterval(interval);
          res.json(progressResponse);
        }
      } catch (error) {
        clearInterval(interval);
        res.status(500).json({ error: "Error in checking progress" });
      }
    }, 3000);
  } catch (error) {
    console.error("Error in generation request:", error);
    res.status(500).json({ error: "Error in your response request" });
  }
});

router.post("/upscale", async (req, res) => {
  try {
    const body = req.body;
    const config = {
      method: "post",
      url: `${BASE_URL}/button`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        messageId: `${body.messageId}`,
        button: `${body.upscale}`,
      },
    };
    const response = await axios(config);
    const messageId = response.data.messageId;
    const interval = setInterval(async () => {
      try {
        const progressResponse = await checkProgress(messageId, token);
        if (progressResponse.status === "DONE") {
          clearInterval(interval);
          res.json(progressResponse);
        }
      } catch (error) {
        clearInterval(interval);
        res.status(500).json({ error: "Error in checking progress" });
      }
    }, 5000);
  } catch (error) {
    console.error("Error in generation request:", error);
    res.status(500).json({ error: "Error in your response request" });
  }
});

// router.post("/edit2", async (req, res) => {
//   try {
//     const body = req.body;
//     const config = {
//       method: "post",
//       url: `${BASE_URL}/imagine`,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       data: {
//         prompt: `${body.imgUrl} ${body.prompt}`,
//       },
//     };
//     const response = await axios(config);
//     const messageId = response.data.messageId;
//     const interval = setInterval(async () => {
//       try {
//         const progressResponse = await checkProgress(messageId, token);
//         if (progressResponse.status === "DONE") {
//           clearInterval(interval);
//           res.json(progressResponse);
//         }
//       } catch (error) {
//         clearInterval(interval);
//         res.status(500).json({ error: "Error in checking progress" });
//       }
//     }, 3000);
//   } catch (error) {
//     console.error("Error in Editing request:", error);
//     res.status(500).json({ error: "Error in editing this photo" });
//   }
// });
async function waitForProgress(messageId, token) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const progressResponse = await checkProgress(messageId, token);
        if (progressResponse.status === "DONE") {
          clearInterval(interval);
          resolve(progressResponse);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 3000);
  });
}

// async function performFaceswap(progressResponse, token) {
//   await waitForProgress(progressResponse.messageId, token);
//   const faceswapConfig = {
//     method: "post",
//     url: "https://api.mymidjourney.ai/api/v1/midjourney/faceswap",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjE3NDUsImVtYWlsIjoidG9tbXlub3Z2QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidG9tbXlub3Z2QGdtYWlsLmNvbSIsImlhdCI6MTcxMjE1NTEyN30.7_y4N9JWwr4ji2a9IV4aNIxHVNApABJ1w5ZUq-Gxeqk`,
//     },
//     data: {
//       source: "https://i.ibb.co/XW568yY/pexels-engin-akyurt-1642228.jpg",
//       target: progressResponse.target,
//     },
//   };
//
//   const response = await axios(faceswapConfig);
//   return response.data;
// }

router.post("/edit", async (req, res) => {
  try {
    const body = req.body;
    const config = {
      method: "post",
      url: `${BASE_URL}/imagine`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        prompt: `${body.imgUrl} ${body.prompt}`,
      },
    };
    const response = await axios(config);
    const messageId = response.data.messageId;

    await waitForProgress(messageId, token);

    const configup = {
      method: "post",
      url: `${BASE_URL}/button`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        messageId: `${messageId}`,
        button: `U2`,
      },
    };
    console.log(messageId + "normal");
    const responseup = await axios(configup);
    const messageIdup = responseup.data.messageId;
    console.log(messageIdup);

    const progressResponse2 = await waitForProgress(messageIdup, token);
    /** [FIX: Uncomment and change to faceswapResponse] */
    // const faceswapResponse = await performFaceswap(progressResponse2);
    res.json(progressResponse2);
  } catch (error) {
    console.error("Error in Editing request:", error);
    res.status(500).json({ error: "Error in editing this photo" });
  }
});

function extractImgbbUrl(output) {
  try {
    // Extract the imgbb URL using regex
    const regex = /Loaded as API: .+?\n(.+?)\n/;
    const match = output.match(regex);
    if (match && match.length > 1) {
      return match[1];
    } else {
      console.error("Failed to extract imgbb URL from Python output:", output);
      return null;
    }
  } catch (error) {
    console.error("Error extracting imgbb URL:", error);
    return null;
  }
}
router.post("/faceswap", async (req, res) => {
  try {
    const body = req.body;
    const sourceUrl = `"${body.source}"`; // Enclose source URL in double quotes
    const targetUrl = `"${body.target}"`; // Enclose target URL in double quotes
    // TODO: Pass image URLs as arguments python check.py targetURl sourceUrl
    exec(
      `python check.py ${targetUrl} ${sourceUrl}`,
      (error, stdout, _stderr) => {
        if (error) {
          console.error("Error executing Python script:", error);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        const imgbbUrl = extractImgbbUrl(stdout);
        res.status(200).json({ output: imgbbUrl });
      },
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
