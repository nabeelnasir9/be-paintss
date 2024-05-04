const express = require("express");
const OpenAI = require("openai");
const axios = require("axios");
const router = express.Router();
const token = process.env.X_API_KEY || null;

const token2 = process.env.DALLE_KEY || null;

const openai = new OpenAI({ apiKey: token2 });

async function CheckProgress(reqid) {
  return new Promise((resolve, reject) => {
    const url = "https://api.midjourneyapi.xyz/mj/v2/fetch";
    const interval = setInterval(async () => {
      try {
        const rq = await axios.post(url, { task_id: reqid });
        if (rq.data.status === "finished") {
          clearInterval(interval);
          resolve(rq.data);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 3000);
  });
}

async function checkProgressSwap(reqid) {
  return new Promise((resolve, reject) => {
    const url = "https://api.goapi.xyz/api/face_swap/v1/fetch";
    const interval = setInterval(async () => {
      try {
        const rq = await axios.post(url, { task_id: reqid });
        if (rq.data.data.status === "success") {
          clearInterval(interval);
          resolve(rq.data);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 3000);
  });
}

// router.get("/openai", async (req, res) => {
//   try {
//     const image = await openai.images.generate({
//       model: "dall-e-3",
//       prompt:
//         "A boy running in the fields anime style.Subject is facing the camera. fullshot.anime style . --ar 1:2 --style raw",
//     });
//     res.json(image);
//   } catch (error) {
//     res.json(error);
//   }
// });
// router.post("/multi", async (req, res) => {
//   try {
//     const body = req.body;
//     console.log(req.body);
//
//     const makeRequest = async (prompt) => {
//       const config = {
//         headers: {
//           "X-API-KEY": token,
//         },
//         data: {
//           prompt: prompt,
//           aspect_ratio: "",
//           process_mode: "relax",
//           webhook_endpoint: "",
//           webhook_secret: "",
//         },
//         url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
//         method: "post",
//       };
//
//       const answer = await axios(config);
//       const response = answer.data;
//       const taskResult = await CheckProgress(response.task_id);
//       return taskResult;
//     };
//
//     const prompts = [];
//     for (let i = 0; i < body.images; i++) {
//       const prompt = `${body.prompt} ${body.selectedstyle}.Subject is facing the camera. fullshot.${body.selectedstyle} style . --ar ${body.dimensions} --style raw`;
//       prompts.push(prompt);
//     }
//
//     const imageRequests = prompts.map((prompt) => makeRequest(prompt));
//
//     const taskResults = await Promise.all(imageRequests);
//
//     const allFinished = taskResults.every(
//       (taskResult) => taskResult.status === "finished",
//     );
//
//     if (allFinished) {
//       const responseArray = taskResults.map((taskResult) => ({
//         status: taskResult.status,
//         task_id: taskResult.task_id,
//         uri: taskResult.task_result.image_url,
//         process_time: taskResult.process_time,
//       }));
//       res.status(200).json(responseArray);
//     } else {
//       const responseArray = taskResults.map((taskResult) => ({
//         status: taskResult.status,
//         task_id: taskResult.task_id,
//       }));
//       res.status(202).json({
//         message: "At least one task is still processing",
//         tasks: responseArray,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({
//       message: "An error occurred",
//       error: error.message || JSON.stringify(error, null, 2),
//     });
//   }
// });
// router.post("/upscale", async (req, res) => {
//   try {
//     const body = req.body;
//     console.log(req.body);
//     const config = {
//       headers: {
//         "X-API-KEY": token,
//       },
//       data: {
//         origin_task_id: `${body.messageId}`,
//         index: `${body.upscale}`,
//         webhook_endpoint: "",
//         webhook_secret: "",
//       },
//       url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
//       method: "post",
//     };
//     const answer = await axios(config);
//     const response = answer.data;
//
//     const taskResult = await CheckProgress(response.task_id);
//     if (taskResult.status === "finished") {
//       res.status(200).json({
//         status: taskResult.status,
//         task_id: taskResult.task_id,
//         uri: taskResult.task_result.image_url,
//         process_time: taskResult.process_time,
//       });
//     }
//   } catch (error) {
//     res.status(400).json({
//       message: "An error occured",
//       error: error.message,
//     });
//   }
// });

router.post("/imgtoimg", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    const config = {
      headers: {
        "X-API-KEY": token,
      },
      data: {
        prompt: `${body.imgUrl} ${body.style}`,
        aspect_ratio: "",
        process_mode: "relax",
        webhook_endpoint: "",
        webhook_secret: "",
      },
      url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
      method: "post",
    };

    const answer = await axios(config);
    const response = answer.data;
    console.log(response);
    const taskResult = await CheckProgress(response.task_id);
    const id = taskResult.task_id;
    if (taskResult.status === "finished") {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          origin_task_id: `${id}`,
          index: `1`,
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
        method: "post",
      };
      const answer = await axios(config);
      const response = answer.data;

      const taskResult2 = await CheckProgress(response.task_id);
      if (taskResult2.status === "finished") {
        res.status(200).json([
          {
            status: taskResult2.status,
            task_id: taskResult2.task_id,
            uri: taskResult2.task_result.image_url,
            process_time: taskResult2.process_time,
          },
        ]);
      }
    } else {
      res.status(400).json({
        message: "Error in Upscaling",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});
router.post("/multi", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);

    const generateAndUpscale = async (prompts) => {
      const imageRequests = [];
      await Promise.all(
        prompts.map(async (prompt) => {
          const editResult = await generateImage(prompt);
          const upscaleResult = await upscaleImage(editResult.task_id);
          imageRequests.push({
            status: upscaleResult.status,
            task_id: upscaleResult.task_id,
            uri: upscaleResult.task_result.image_url,
            process_time: upscaleResult.process_time,
          });
        }),
      );

      return imageRequests;
    };

    const generateImage = async (prompt) => {
      const editConfig = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          prompt: prompt,
          aspect_ratio: "",
          process_mode: "relax",
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
        method: "post",
      };
      const editResponse = await axios(editConfig);
      return await CheckProgress(editResponse.data.task_id);
    };

    const upscaleImage = async (task_id) => {
      const upscaleConfig = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          origin_task_id: task_id,
          index: "1",
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
        method: "post",
      };
      const upscaleResponse = await axios(upscaleConfig);
      return await CheckProgress(upscaleResponse.data.task_id);
    };

    const prompts = [];
    for (let i = 0; i < body.images; i++) {
      const prompt = `${body.prompt} . Make it in this ${body.selectedstyle} style and try to as accurate to the style as possible. Subject is facing the camera. --ar ${body.dimensions} --style raw`;
      prompts.push(prompt);
    }
    const imageRequests = await generateAndUpscale(prompts);
    res.status(200).json(imageRequests);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

router.post("/faceswap", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const config = {
      headers: {
        "X-API-KEY": token,
        "Content-Type": "application/json",
      },
      method: "post",
      url: "https://api.goapi.xyz/api/face_swap/v1/async",
      data: {
        target_image: `${body.target}`,
        swap_image: `${body.source}`,
        result_type: "url",
      },
    };

    const answer = await axios(config);
    const task_id = answer.data.data.task_id;
    const taskResult = await checkProgressSwap(task_id);
    if (taskResult.data.status === "success") {
      res.status(200).json({
        status: taskResult.status,
        uri: taskResult.data.image,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

module.exports = router;
