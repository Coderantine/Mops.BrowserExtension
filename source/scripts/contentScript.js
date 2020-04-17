

document.onkeypress = function(e) {
}

var pc = new RTCPeerConnection(
{ 
    iceServers: 
    [ 
        { 
            urls: ['turn:35.193.0.31:3478'], 
            username: 'babgev',
            credential: 'babo8rembo8',
            credentialType: 'password'
        } 
    ]
});

pc.onicecandidate = async function(e) {

    var candidate = e.candidate;
    var msg =
    {
        messageType = 3, // ice
        data = `${candidate.candidate}|${candidate.sdpMLineIndex}|${candidate.sdpMid}`,
        iceDataSeparator = "|"
    };

    await Send(obj);
}

pc.onnegotiationneeded = async () => {
    await pc.setLocalDescription(await pc.createOffer());
    // send the offer to the other peer

    var msg = new SignallingMessage
    {
        MessageType = WireMessageTypeFromString(pc.localDescription.type),
        Data = pc.localDescription.sdp,
        IceDataSeparator = "|"
    };
    
    signaling.send(msg);
};


var dc = pc.createDataChannel("vzgo", { id: 14, ordered: true })

async function Send(obj) {

}

function WireMessageTypeFromString(msgType)
{
    if(msgType === "offer") return 0;
    if(msgType === "answer") return 1;
    return undefined;
}


document.onmousemove = function(e)
{
    if(dc && dc.readyState == "open") {
        
    }
};