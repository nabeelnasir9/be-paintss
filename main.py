from gradio_client import Client

client = Client("https://felixrosberg-face-swap.hf.space/--replicas/p7pq1/")
result = client.predict(
    "https://i.ibb.co/jhhhd9t/local.png",  # filepath  in 'Target' Image component
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWHXlGJ_r6d7zLbXShOtvK7GxT9V7cSL8tRqojtZ2g_ObMvzgG",  # filepath  in 'Source' Image component
    0,  # float (numeric value between 0 and 100) in 'Anonymization ratio (%)' Slider component
    0,  # float (numeric value between 0 and 100) in 'Adversarial defense ratio (%)' Slider component
    [
        "Compare"
    ],  # List[Literal['Compare', 'Anonymize', 'Reconstruction Attack', 'Adversarial Defense']]  in 'Mode' Checkboxgroup component
    api_name="/run_inference",
)
print(result)
