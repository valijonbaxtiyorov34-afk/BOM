const startBtn = document.querySelector(".start-btn");
const stopBtn = document.querySelector(".stop-btn");

let mediaRecorder = null;
let stream = null;
let chunks = [];

startBtn.addEventListener("click", startRecording);
stopBtn.addEventListener("click", stopRecording);

async function startRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") return;

    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });
    } catch (err) {
        console.warn("Screen sharing was cancelled:", err);
        return;
    }

    chunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", saveRecording);

    stream.getVideoTracks()[0].addEventListener("ended", stopRecording);

    mediaRecorder.start();
    document.title = "● Recording...";
}

function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === "inactive") return;

    mediaRecorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    document.title = "Screen Recorder";
}

function saveRecording() {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `recording-${Date.now()}.webm`;
    link.click();

    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
