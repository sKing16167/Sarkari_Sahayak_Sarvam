// Audio recording and conversion utilities

export async function audioBlobToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 16000,
  });

  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
  await audioContext.close();
  return wavBlob;
}

function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
  const numOfChan = 1;
  const length = len * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample: number = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF chunk descriptor
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // FMT sub-chunk
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // SubChunk1Size (16 for PCM)
  setUint16(1); // AudioFormat (1 = PCM)
  setUint16(numOfChan); // NumChannels (1 = Mono)
  setUint32(abuffer.sampleRate); // SampleRate (16000)
  setUint32(abuffer.sampleRate * 2 * numOfChan); // ByteRate
  setUint16(numOfChan * 2); // BlockAlign
  setUint16(16); // BitsPerSample

  // Data sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // SubChunk2Size

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (offset < len) {
    for (let i = 0; i < numOfChan; i++) {
      // If stereo or multi-channel, blend down to mono
      if (channels.length > 1) {
        sample = Math.max(-1, Math.min(1, (channels[0][offset] + channels[1][offset]) / 2));
      } else {
        sample = Math.max(-1, Math.min(1, channels[0][offset]));
      }
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
