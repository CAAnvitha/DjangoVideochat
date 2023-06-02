const APP_ID = "8ea990ed3d774e289e2a178fc5e4de73";
const CHANNEL = "main";
const TOKEN =
  "007eJxTYOBKKv6cmem9QG1e9Gr5Go7evOV/DiexujZyJP68VGXeeFGBwSI10dLSIDXFOMXc3CTVyMIy1SjR0NwiLdk01SQl1dz43KTKlIZARoa901cwMEIhiM/CkJuYmcfAAAAbIB+Y";

console.log("Stream js connected");

let UID;
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localTracks = [];
let remoteUsers = {};
let joinAndDisplayLocalStream = async () => {
  client.on("user-published", handleUserJoined);
  client.on('user-left', handleUserLeft)

  UID = await client.join(APP_ID, CHANNEL, TOKEN, null);
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
  let player = `<div class="video-container" id="user-container-${UID}">
  <div class="username-wrapper"><span class="user-name">My Name</span></div>
  <div class="video-player" id="user-${UID}"></div>
  </div>`;
  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);
  localTracks[1].play(`user-${UID}`);
  await client.publish([localTracks[0], localTracks[1]]);
};
let handleUserJoined =  async(user, mediaType)=>{
    remoteUsers[user.uid]=user
    await client.subscribe(user,mediaType)
    if (mediaType === 'video'){
        let player = document. getElementById(`user -container-${user.uid}`)
        if(player != null){
            player. remove()
        }
        player = `<div  class="video-container" id="user-container-${user.uid}">
        <div class="video-player" id="user-${user.uid}"></div>
        <div class="username-wrapper"><span class="user-name">My Name</span></div>
        </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }
    if (mediaType === 'audio'){
        user.audioTrack.play()
    }

}
let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}
let leaveAndRemoveLocalStream = async () => {
    for (let i=0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    deleteMember()
    window.open('/', '_self')
}
let toggleCamera = async (e) => {
    console.log('TOGGLE CAMERA TRIGGERED')
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}

let toggleMic = async (e) => {
    console.log('TOGGLE MIC TRIGGERED')
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'
    }
}
let createMember = async () => {
    let response = await fetch('/create_member/', {
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
    })
    let member = await response.json()
    return member
}


let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async () => {
    let response = await fetch('/delete_member/', {
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME, 'room_name':CHANNEL, 'UID':UID})
    })
    let member = await response.json()
}

window.addEventListener("beforeunload",deleteMember);

joinAndDisplayLocalStream()
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
