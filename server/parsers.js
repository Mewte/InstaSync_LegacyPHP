module.exports.replaceTags = function(message){ //ty faqqq
    var tagsToReplace = {
        '<': '&lt;',
        '>': '&gt;'
    };
    var regex = new RegExp("["+Object.keys(tagsToReplace).join("") + "]","g");
    message = message.replace(regex, function replaceTag(tag) {return tagsToReplace[tag] || tag; });
    return message;
}
var urlParser = new(function() {
    var match,
        provider, //the provider e.g. youtube,twitch ...
        mediaType, // stream, video or playlist (no youtube streams)
        id, //the video-id
        channel, //for twitch and livestream
        playlistId, //youtube playlistId
        providers = {
            'parse': {},
            'createUrl': {}
        },
        result;
    this.parse = function(url) {
        match = url.match(/(https?:\/\/)?([^\.]+\.)?(\w+)\./i);
        provider = match ? match[3] : undefined;
        if (match && provider && providers.parse[provider]) {
            result = providers.parse[provider].call(this, url);
            if (result) {
                return {
                    'provider': result.provider || provider,
                    'mediaType': result.mediaType || 'video',
                    'id': result.id || undefined,
                    'playlistId': result.playlistId || undefined,
                    'channel': result.channel || undefined
                };
            }
        }
        return undefined;
    };
    this.bind = function(names, callbackParse, callbackCreareUrl) {
        for (var i = 0; i < names.length; i += 1) {
            providers.parse[names[i]] = callbackParse;
            providers.createUrl[names[i]] = callbackCreareUrl;
        }
    };
    this.createUrl = function(videoInfo) {
        if (videoInfo.provider && providers.createUrl[videoInfo.provider]) {
            return providers.createUrl[videoInfo.provider].call(this, videoInfo);
        }
        return undefined;
    };
})();

urlParser.bind(['youtu', 'youtube'], function(url) {
    var match,
        mediaType,
        id,
        playlistId;
    match = url.match(/(((v|be|videos)\/)|(v=))([\w\-]{11})/i);
    id = match ? match[5] : undefined;
    match = url.match(/list=([\w\-]+)/i);
    playlistId = match ? match[1] : undefined;

    if (!id && !playlistId) {
        return undefined;
    }
    if (id) {
        mediaType = 'video';
    } else {
        mediaType = 'playlist';
    }
    return {
        'provider': 'youtube',
        'mediaType': mediaType,
        'id': id,
        'playlistId': playlistId
    };
}, function(videoInfo) {
    var url;
    if (videoInfo.mediaType === 'video') {
        if (!videoInfo.playlistId) {
            url = String.format('http://youtu.be/{0}', videoInfo.id);
        } else {
            url = String.format('https://www.youtube.com/watch?v={0}&list={1}', videoInfo.id, videoInfo.playlistId);
        }
    } else if (videoInfo.mediaType === 'playlist') {
        url = String.format('https://www.youtube.com/playlist?feature=share&list={0}', videoInfo.playlistId);
    }
    return url;
});

urlParser.bind(['vimeo'], function(url) {
    var match,
        id;
    match = url.match(/(\/((channels\/[\w]+)|(album\/\d+)?\/video))?\/(\d+)/i);
    id = match ? match[5] : undefined;
    if (!id) {
        return undefined;
    }
    return {
        'id': id
    };
}, function(videoInfo) {
    return String.format('http://vimeo.com/{0}', videoInfo.id);
});

urlParser.bind(['twitch'], function(url) {
    var match,
        mediaType,
        id,
        channel;
    match = url.match(/twitch\.tv\/(\w+)(\/.\/(\d+))?/i);
    channel = match ? match[1] : undefined;
    id = match ? match[3] : undefined;
    match = url.match(/((\?channel)|(\&utm_content))=(\w+)/i);
    channel = match ? match[1] : channel;
    if (!channel) {
        return undefined;
    }
    if (id) {
        mediaType = 'video';
    } else {
        mediaType = 'stream';
    }
    return {
        'mediaType': mediaType,
        'id': id,
        'channel': channel
    };
}, function(videoInfo) {
    var url;
    if (videoInfo.mediaType === 'stream') {
        url = String.format('http://twitch.tv/{0}', videoInfo.channel);
    } else if (videoInfo.mediaType === 'video') {
        url = String.format('http://twitch.tv/{0}/c/{1}', videoInfo.channel, videoInfo.id);
    }
    return url;
});

urlParser.bind(['dai', 'dailymotion'], function(url) {
    var match,
        id;
    provider = 'dailymotion';
    match = url.match(/((\/video)|(ly))\/([^_]+)/i);
    id = match ? match[4] : undefined;
    if (!id) {
        return undefined;
    }
    return {
        'provider': 'dailymotion',
        'id': id
    };
}, function(videoInfo) {
    return String.format('http://dai.ly/{0}', videoInfo.id);;
});

urlParser.bind(['livestream'], function(url) {
    var match,
        channel;
    //not finished
    match = url.match(/livestream\.com\/(\w+)/i);
    channel = match ? match[1] : undefined;
    if (!channel) {
        return undefined;
    }

    return {
        'mediaType': 'stream',
        'channel': channel
    };
});
module.exports.parseURL = urlParser.parse;