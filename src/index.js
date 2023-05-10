import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { spawn } from 'node:child_process'
import { request } from 'node:https';

createServer(async (req, res) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
    }

    if (req.method === "OPTIONS") {
        res.writeHead(204, headers);
        res.end();
        return;
    }
    
    res.writeHead(200, {
        'Content-Type': 'video/mp4'
    })

    const ffmpegProcess = spawn('ffmpeg', [
        '-i','pipe:0',
        '-f','mp4',
        '-vcodec','h264',
        '-acodec','aac',
        '-movflags','frag_keyframe+empty_moov+default_base_moof',
        '-b:v','1500k',
        '-maxrate','1500k',
        '-bufsize','1000k',
        '-f','mp4',
        'pipe:1'],{ stdio: ['pipe', 'pipe', 'pipe']})

    createReadStream('./assets/video-ready.mp4').pipe(ffmpegProcess.stdin);

    ffmpegProcess.stderr.on('data', msg => console.log(msg));
    ffmpegProcess.stdout.pipe(res);

    req.once('close', ()=>{
        ffmpegProcess.stdout.destroy();
        ffmpegProcess.stdin.destroy();
        console.log('disconnected!', ffmpegProcess.kill());
    })

}).listen(3000, () => console.log("Server running at 3000"));
