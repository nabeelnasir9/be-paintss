const express = require("express");
const axios = require("axios");
const router = express.Router();
const token = process.env.X_API_KEY || null;

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

router.post("/imgtoimg", async (req, res) => {
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
      const prompt = `${body.imgUrl} change it into ${body.style} style and try to be as accurate to the style as possible. Subject is facing the camera. --ar ${body.dimensions} --style raw --iw 1`;
      // const prompt = `${body.imgUrl} Subject is facing the camera.The style of image is ${body.style} with strong emphasis on the ${body.style} Aesthetic . --sref https://i.ibb.co/3199ksy/belle-beauty-and-the-beast-by-mari945-d94gx6c-375w-2x.jpg --ar ${body.dimensions} --style raw --iw 1`;

      console.log(prompt);
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
      const prompt = `${body.prompt}. Make it in ${body.selectedstyle} style and try to be as accurate to the style as possible. Subject is facing the camera. --ar ${body.dimensions} --style raw`;
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

module.exports = router;
