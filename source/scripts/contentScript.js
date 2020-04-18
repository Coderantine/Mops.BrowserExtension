import * as signalR from '@microsoft/signalr';

const signalRConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://8740a47f.ngrok.io/signalling")
    .withAutomaticReconnect()
    .build();

var pc = undefined;
var dc = undefined;

signalRConnection.start().then(async () => {

    await signalRConnection.send("JoinRoom", "Vzgo");

    pc = new RTCPeerConnection(
    { 
        iceServers: 
        [ 
            { 
                urls: ['turn:global.turn.twilio.com:3478?transport=udp', 'turn:global.turn.twilio.com:3478?transport=udp', 'turn:global.turn.twilio.com:3478?transport=tcp', 'turn:global.turn.twilio.com:3478?transport=tcp', 'turn:global.turn.twilio.com:443?transport=tcp', 'turn:global.turn.twilio.com:443?transport=tcp'], 
                username: 'a1a272dfe3e684077a5c024c0ae8d044d07ff29919a6d2927d090bfb327ba1c6',
                credential: 'U+cDrn79mY7Y5QsVCX8X01U0oCRlCP1gUUQy95YNE/8=',
                credentialType: 'password'
            } 
        ]
    });

    dc = pc.createDataChannel("vzgo", { id: 14 })

    var offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    Send({
        MessageType : wireMessageTypeFromString(offer.type),
        Data : offer.sdp,
        IceDataSeparator : '|'
    });

    pc.onicecandidateerror = function(e) {
        console.log("candidate-error");
        console.log(e);
    }

    pc.onconnectionstatechange = function(e) {
        console.log("state-changed");
        console.log(e);
    }
    
    pc.onicecandidate = function(e) {
        console.log(e);
        var candidate = e.candidate;
        if(candidate) {
            Send({
                messageType : 3,
                data : `${candidate.candidate}|${candidate.sdpMLineIndex}|${candidate.sdpMid}`,
                iceDataSeparator : '|'
            });
        }
    }
    
    
    function Send(obj) {
        signalRConnection.invoke("SendMessage", "Vzgo", JSON.stringify(obj)).catch(err => console.error(err));
    }
    
    signalRConnection.on("Message", async (message) =>
    {
        var msg = JSON.parse(message);
        if(!msg) return;
        switch (msg.MessageType)
        {
            case 1:
                await pc.setRemoteDescription({ type: "offer", sdp: msg.Data});
                await pc.setLocalDescription(await pc.createAnswer());
                Send({
                    MessageType : wireMessageTypeFromString(pc.localDescription.type),
                    Data : pc.localDescription.sdp,
                    IceDataSeparator : '|'
                });
                break;
    
            case 2:
                await pc.setRemoteDescription({ type: "answer", sdp: msg.Data});
                console.log("answer set");
                break;
    
            case 3:
                var parts = msg.Data.split('|');
                // Note the inverted arguments for historical reasons.
                // 'candidate' is last in AddIceCandidate(), but first in the message.
                var sdpMid = parts[2];
                var sdpMLineindex = parts[1];
                var candidate = parts[0];
                var iceCandidateInit = {candidate, sdpMid, sdpMLineindex };
                console.log("ice candidat");
                console.log(iceCandidateInit);
                await pc.addIceCandidate(iceCandidateInit);
                break;
        }
    });
})



function wireMessageTypeFromString(msgType)
{
    if(msgType === "offer") return 1;
    if(msgType === "answer") return 2;
    return 0;
}


document.onmousemove = function(e)
{
    if(dc && dc.readyState == "open") {
        dc.send(JSON.stringify({
            a : 3000,
            b : 1800,
            c : e.clientX,
            d : e.clientY, }))
    }
};