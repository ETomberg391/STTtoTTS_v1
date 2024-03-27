# STTtoTTS_v1
LocalLLM speech to speech method using WhisperAI->TextGenWebUI -> AllTalk AI


This is a method to press a button on a webapp, speak to your AI, and to get an audio response. 

Essentially I have a process I've been working on the past few days that's gone through some revamps to this method that works well. It just bottled down to keeping AllTalk in Standalone mode and away from textgenui.

Step 1: pip install:
- SpeechRecognition
- openai-whisper
- soundfile
- ffmpeg
:
Step 2: Git Clone Alltalk (Outside of extensions folder)
- git clone https://github.com/erew123/alltalk_tts
- Change to the new folder for alltalk_tts
- run atsetup.bat (For Windows, atsetup.sh for Linux/Mac)
- Choose to install as Standalone in the settings.

Additionally for AllTalk, go to https://github.com/erew123/alltalk_tts#-deepspeed-installation-options for more details. Highly recommend deepspeed with alltalk. If you choose to install deepspeed, remember to go to alltalk_tts/confignew.json and set deepspeed activate to true.
:
Step 3: Modify text-generation-webui\extensions\openai
- Open the file in whatever text editor you prefer.
- Edit the top rows, the imports to include what is in attached file 'openai_Script_Import_Requirements.txt'
- Then add in the new /audio/speechGenerations app option found in the attached file 'Openai_Script_audio-speechGenerations_addition.txt'
- Then add in te new /audio/speechAndTextGenerations app option found in 'Openai_Script_audio-speechAndTextGenerations_addition.txt'
I prefer to add both options right below /audio/transcriptions app option within the script.py
:
Step 4: Checking textgenui server settings, and running the server.
- I am currently testing all of this on Windows. My command line is as follows:
- start_windows.bat --api --ssl-keyfile key.pem --ssl-certfile cert.pem --listen --loader llama.cpp --model mixtral-8x7b-instruct-v0.1.Q4_K_M.gguf --n_ctx 8000 --n-gpu-layers 90 --threads 8 --tensor_split 17.5,10.5 --numa --row_split

Note: If you are testing this outside of the localhost machine, I think it requires https, so you will need to create a key.pem + cert.pem, add those to the text-generation-webui\ directory, and add the arguments as described in my example.
:
Step 5: Run AllTalk Standalone server
- open your alltalk directory, and run the 'start_alltalk.bat' (for Windows 10, tts_server.py for Linux/Mac)

Step 6: Run Webserver with example HTML (OR install Android Appto test)
- You'll want to run a webserver. My example I have a simple WAMP 3.3.0 running:https://www.wampserver.com/en/
- Setup WAMP, and add the html document example 'STT-to-TTS_Example_html.html' to the server (Probably change the name to something simple.
- EDIT the html, and change the https://10.9.0.3:5000/v1/audio/speechGenerations, to your server's IP address and api port (textgen's default is port 5000)
- Reboot the WAMP server after adding.
- Finally, open your browser, and attempt to go to http://localhost/STT-to-TTS_Example_html.html or whatever you have set as the file's name.
- ALTERNATIVELY: Go to my Android app repo (https://github.com/ETomberg391/Glor), and install the newest release to your Android Phone.
- Run the app, and test
- Test the record button. If successful, you should get a response back that autoplays.

Final Notes:
- 90% Free Claude Sonnet's code assisting.
- Only tested on Windows 10 so far. The main system it is going to host is Ubuntu, so test soon.
- My servers are P40+GTX1080ti a 35GB VRAM model... Mixtral 8k context + Whisper ai + AllTalk base model fills my P40+gtx1080ti all the way up.
