import sys
import requests
import base64
from gradio_client import Client


def upload_image_to_imgbb(image_path):
    try:
        # Read the image file as binary data
        with open(image_path, "rb") as file:
            # Encode the binary data as base64
            base64_image = base64.b64encode(file.read()).decode("utf-8")

        # Set your imgbb API key
        api_key = "971d2de9105ee2ad9f60172add0ff130"

        # Create the request payload
        payload = {"key": api_key, "image": base64_image}

        # Upload the image to imgbb
        response = requests.post("https://api.imgbb.com/1/upload", data=payload)

        # Check if the request was successful
        if response.status_code == 200:
            # Extract the URL of the uploaded image from the response
            url = response.json()["data"]["url"]
            return url
        else:
            print("Failed to upload image to imgbb. Status code:", response.status_code)
            return None
    except Exception as e:
        print("Error uploading image to imgbb:", e)
        return None


def run_gradio_and_upload(target_image_url, source_image_url):
    try:
        # Initialize Gradio client
        client = Client("https://felixrosberg-face-swap.hf.space/--replicas/p7pq1/")

        # Make a prediction using the Gradio client
        result = client.predict(
            target_image_url,  # Target image URL
            source_image_url,  # Source image URL
            0,  # Anonymization ratio (%)
            0,  # Adversarial defense ratio (%)
            ["Compare"],  # Mode
            api_name="/run_inference",
        )

        # Upload the resulting image to imgbb
        imgbb_url = upload_image_to_imgbb(result)

        return imgbb_url  # Return the imgbb URL
    except Exception as e:
        print("Error:", e)


# Extract target and source image URLs from command line arguments
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python your_script.py <target_image_url> <source_image_url>")
        sys.exit(1)

    target_image_url = sys.argv[1]
    source_image_url = sys.argv[2]

    # Run the Gradio client and upload the result
    imgbb_url = run_gradio_and_upload(target_image_url, source_image_url)
    if imgbb_url:
        print(imgbb_url)  # Print the imgbb URL
    else:
        print("Failed to upload image to imgbb.")
