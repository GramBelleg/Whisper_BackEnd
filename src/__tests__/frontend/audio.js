document.getElementById("playAudioButton").addEventListener("click", async () => {
    const blobName = "example-audio.mp3"; // Replace this with your actual blob name or dynamically pass it
    const audioUrl = `/audio/${blobName}`; // URL to your backend API serving the audio file

    const audioPlayer = document.getElementById("audioPlayer");

    // Set the source of the audio element to the backend URL
    audioPlayer.src = audioUrl;

    // Load and play the audio
    audioPlayer.load();
    audioPlayer
        .play()
        .then(() => {
            console.log("Audio playing...");
        })
        .catch((error) => {
            console.error("Error playing audio:", error);
        });
});
