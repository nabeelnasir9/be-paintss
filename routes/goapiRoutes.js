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

router.post("/create2", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const makeRequest = async () => {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          prompt: body.prompt,
          aspect_ratio: "1:2",
          process_mode: "relax",
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
        method: "post",
      };

      const answer = await axios(config);
      const response = answer.data;
      const taskResult = await CheckProgress(response.task_id);
      return taskResult;
    };

    const task1Promise = makeRequest();
    // const task2Promise = makeRequest();

    const [taskResult1] = await Promise.all([
      task1Promise,
      // task2Promise,
    ]);
    if (
      taskResult1.status === "finished"
      // taskResult2.status === "finished"
    ) {
      res.status(200).json([
        {
          status: taskResult1.status,
          task_id: taskResult1.task_id,
          uri: taskResult1.task_result.image_url,
          process_time: taskResult1.process_time,
        },
        // {
        //   status: taskResult2.status,
        //   task_id: taskResult2.task_id,
        //   uri: taskResult2.task_result.image_url,
        //   process_time: taskResult2.process_time,
        // },
      ]);
    } else {
      res.status(202).json([
        {
          message: "At least one task is still processing",
          status1: taskResult1.status,
          // status2: taskResult2.status,
        },
      ]);
    }
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
    console.log(req.body);
    const makeRequest = async (prompt) => {
      const config = {
        headers: {
          "X-API-KEY": token,
        },
        data: {
          prompt: prompt,
          aspect_ratio: "1:2",
          process_mode: "relax",
          webhook_endpoint: "",
          webhook_secret: "",
        },
        url: "https://api.midjourneyapi.xyz/mj/v2/imagine",
        method: "post",
      };

      const answer = await axios(config);
      const response = answer.data;
      const taskResult = await CheckProgress(response.task_id);
      return taskResult;
    };
    const prompt = `https://i.ibb.co/3TR9Vxj/images-1.jpg Subject is a young ${body.ethnicity} ${body.gender} on island carrying abag on a stick and skipping carelessly.subjectis facing the camera. fullshot.photorealistic details.tarot card. --ar 1:2 --style raw `;
    const prompt2 = `https://i.ibb.co/3TR9Vxj/images-1.jpg young ${body.ethnicity} ${body.gender}. magician. photorealistic details. tarot card. --ar 1:2 --style raw`;
    const prompt3 = `https://i.ibb.co/3TR9Vxj/images-1.jpg young ${body.ethnicity} ${body.gender} sitting on a throne.the ${body.gender} has a feminine quality.the ${body.gender} is wearing white. 45 degree sideview. photorealistic details.tarot card. --ar 1:2 --style raw`;
    const prompt4 = `https://i.ibb.co/3TR9Vxj/images-1.jpg a young ${body.ethnicity} ${body.gender} riding in a chariot, adorned by armor and a crown,two sphinxes, a canopy full of stars. photorealistic details.tarot card. --ar 1:2 --style raw`;
    const prompt5 = `https://i.ibb.co/3TR9Vxj/images-1.jpg young ${body.ethnicity} islander ${body.gender}. lonely. holding a lantern. holding awalking stick.sideviewlookingatcamera.photorealistic details.tarot card. --ar 1:2 --style raw`;

    const task1Promise = makeRequest(prompt);
    const task2Promise = makeRequest(prompt2);
    const task3Promise = makeRequest(prompt3);
    const task4Promise = makeRequest(prompt4);
    const task5Promise = makeRequest(prompt5);

    const [taskResult1, taskResult2, taskResult3, taskResult4, taskResult5] =
      await Promise.all([
        task1Promise,
        task2Promise,
        task3Promise,
        task4Promise,
        task5Promise,
      ]);
    if (
      taskResult1.status === "finished" &&
      taskResult2.status === "finished" &&
      taskResult3.status === "finished" &&
      taskResult4.status === "finished" &&
      taskResult5.status === "finished"
    ) {
      res.status(200).json([
        {
          status: taskResult1.status,
          task_id: taskResult1.task_id,
          uri: taskResult1.task_result.image_url,
          process_time: taskResult1.process_time,
        },
        {
          status: taskResult2.status,
          task_id: taskResult2.task_id,
          uri: taskResult2.task_result.image_url,
          process_time: taskResult2.process_time,
        },
        {
          status: taskResult3.status,
          task_id: taskResult3.task_id,
          uri: taskResult3.task_result.image_url,
          process_time: taskResult3.process_time,
        },
        {
          status: taskResult4.status,
          task_id: taskResult4.task_id,
          uri: taskResult4.task_result.image_url,
          process_time: taskResult4.process_time,
        },
        {
          status: taskResult5.status,
          task_id: taskResult5.task_id,
          uri: taskResult5.task_result.image_url,
          process_time: taskResult5.process_time,
        },
      ]);
    } else {
      res.status(202).json([
        {
          message: "At least one task is still processing",
          status1: taskResult1.status,
          status2: taskResult2.status,
          status3: taskResult3.status,
          status4: taskResult4.status,
          status5: taskResult5.status,
        },
      ]);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "An error occurred",
      error: error.message || JSON.stringify(error, null, 2),
    });
  }
});

router.post("/upscale", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const config = {
      headers: {
        "X-API-KEY": token,
      },
      data: {
        origin_task_id: `${body.messageId}`,
        index: `${body.upscale}`,
        webhook_endpoint: "",
        webhook_secret: "",
      },
      url: "https://api.midjourneyapi.xyz/mj/v2/upscale",
      method: "post",
    };
    const answer = await axios(config);
    const response = answer.data;

    const taskResult = await CheckProgress(response.task_id);
    if (taskResult.status === "finished") {
      res.status(200).json({
        status: taskResult.status,
        task_id: taskResult.task_id,
        uri: taskResult.task_result.image_url,
        process_time: taskResult.process_time,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occured",
      error: error.message,
    });
  }
});

router.post("/edit", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    const config = {
      headers: {
        "X-API-KEY": token,
      },
      data: {
        prompt: `${body.imgUrl} ${body.prompt}`,
        aspect_ratio: "1:2",
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
        res.status(200).json({
          status: taskResult2.status,
          task_id: taskResult2.task_id,
          uri: taskResult2.task_result.image_url,
          process_time: taskResult2.process_time,
        });
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
