//emotes
var $codes = {
    //"boobies": '<spamtag><img src="http://i.imgur.com/9g6b5.gif" width="51" height="60" spam="1"></spamtag>', Disabled :3
    "weegee": '<img src="http://i.imgur.com/65QFT.png" width="51" height="60">',
    "umad": '<img src="http://i.imgur.com/kODDJ.gif" width="66" height="46">',
    "nowai": '<img src="http://i.imgur.com/XVR2I.jpg" width="46" height="40">',
    "orly": '<img src="http://i.imgur.com/2cRoc.jpg" width="48" height="44">',
    "yarly": '<img src="http://i.imgur.com/FL5zr.jpg" width="48" height="44">',
    "unamused": '<img src="http://i.imgur.com/xpamg.png" width="40" height="40">',
    "invadinggecko": '<img src="http://i.imgur.com/XTRtP.jpg" width="40" height="41">',
    "success": '<img src="http://i.imgur.com/30e00.png" width="28" height="59">',
    "fap": '<img src="http://i.imgur.com/PsY5I.gif" width="33" height="40">',
    "dilbert": '<img src="http://i.imgur.com/VpmN8.jpg" width="56" height="38">',
    "nope": '<img src="http://i.imgur.com/N97Di.png" width="30" height="41">',
    "foreveralone": '<img src="http://i.imgur.com/obllO.png" width="30" height="36">',
    "dolan": '<img src="http://i.imgur.com/gZe9z.png" width="30" height="37">',
    "sanic": '<img src="http://i.imgur.com/CTZGo.png" width="31" height="33">',
    "lolface": '<img src="http://i.imgur.com/jP8QL.png" width="28" height="34">',
    ":3": '<img src="http://i.imgur.com/SAyYM.png" width="30" height="29">',
    "megusta": '<img src="http://i.imgur.com/1x6es.png" width="30" height="31">',
    "pekaface": '<img src="http://i.imgur.com/RQfvp.png" width="25" height="25">',
    "datass": '<img src="http://i.imgur.com/1awtK.png" width="30" height="30">',
    "babyseal": '<img src="http://i.imgur.com/GiBiY.png" width="30" height="21">',
    //"meatspin": '<img src="http://i.imgur.com/nLiEm.gif" width="30" height="30">', Disabled :3
    "umaood": '<img src="http://i.imgur.com/Yk6ZV.png" width="33" height="14">',
    "bagger288": '<img src="http://i.imgur.com/sNwfW.png" width="83" height="28">',
    "facepalm": '<img src="http://i.imgur.com/FGs29.jpg" width="40" height="30">',
    "okay": '<img src="http://i.imgur.com/TN1xn.png" width="21" height="30">',
    "imokwiththis": '<img src="http://i.imgur.com/tyu9p.png" width="29" height="30">',
    "pokerface": '<img src="http://i.imgur.com/gbqK7.png" width="30" height="33">',
    "trollface": '<img src="http://i.imgur.com/idXUK.png" width="30" height="25">',
    "pedobear": '<img src="http://i.imgur.com/vRZA9.png" width="18" height="25">',
    "babby": '<img src="http://i.imgur.com/KMtUc.png" width="20" height="27">',
    "gooby": '<img src="http://i.imgur.com/tZ7uG.png" width="40" height="40">',
    "nigga": '<img src="http://i.imgur.com/eAqvn.jpg" width="20" height="30">',
    "fukkireta": '<img src="http://i.imgur.com/e6oan.gif" width="50" height="37">',
    "bro": '<img src="http://i.imgur.com/oMEHr.gif" width="66" height="50">',
    "bikenigger": '<img src="http://i.imgur.com/mAQAc.gif" width="24" height="36">',
    "ecchi": '<img src="http://i.imgur.com/i2SWp.gif" width="60" height="60">',
    "epicsaxguy": '<img src="http://i.imgur.com/aOXm1.gif" width="45" height="45">',
    "snoop": '<img src="http://i.imgur.com/0Bwax.gif" width="20" height="45">',
    "dynamite": '<img src="http://i.imgur.com/0gq5a.gif" width="40" height="40">',
    "lolicatgirls1080p": '<img src="http://i.imgur.com/lwZ8K.gif" width="40" height="31">',
    "birdy": '<img src="http://i.imgur.com/7rhHQ.gif" width="55" height="38">',
    "duane": '<img src="http://i.imgur.com/NSodE.gif" width="55" height="38">',
    "deowitit": '<img src="http://i.imgur.com/LIe61.gif" width="50" height="31">',
    "daddycool": '<img src="http://i.imgur.com/KWKwd.gif" width="60" height="45">',
    "frog": '<img src="http://i.imgur.com/HK8Mc.gif" width="60" height="44">',
    "dog": '<img src="http://i.imgur.com/wtfdb.gif" width="40" height="49">',
    "timotei": '<img src="http://i.imgur.com/q0erE.gif" width="40" height="40">',
    "omnom": '<img src="http://i.imgur.com/Moz8e.gif" height="50" height="50">',
    "brody": '<img src="http://i.imgur.com/dVo0h.gif" width="40" height="40">',
    "chikkin": '<img src="http://i.imgur.com/j5Znq.gif" width="50" height="50">',
    "burt": '<img src="http://i.imgur.com/6bkHh.gif" width="50" height="50">',
    "racist": '<img src="http://i.imgur.com/pad58.gif" width="60" height="50">',
    "bateman": '<img src="http://i.imgur.com/sqmG0.gif" width="60" height="60">',
    "meattball": '<img src="http://i.imgur.com/USvG7.gif" width="40" height="40">',
    "o": '<img src="http://i.imgur.com/doRcz.gif" width="40" height="40">',
    "dansen": '<img src="http://i.imgur.com/Pvq0s.gif" width="40" height="40">',
    "clap": '<img src="http://i.imgur.com/qTy2s.gif" width="60" height="40">',
    "rape": '<img src="http://i.imgur.com/LzEUn.gif" width="60" height="40">',
    "pull": '<img src="http://i.imgur.com/fomgV.jpg" width="40" height="40">',
    "mmmm": '<img src="http://i.imgur.com/GDa6R.jpg" width="40" height="40">',
    "gang": '<img src="http://i.imgur.com/5ziar.gif" width="30" height="40">',
    "notcp": '<img src="http://i.imgur.com/O8O7n.gif" width="25" height="38" >',
    "pomf": '<img src="http://i.imgur.com/lotDJ.gif" width="50" height="40" >',
    "usa": '<img src="http://i.imgur.com/AJdq7Xu.gif" width="25" height="25" >',
    "miku": '<img src="http://i.imgur.com/ScyKroE.gif" width="32" height="43" >',
    "dreck": '<img src="http://i.imgur.com/uYK1FIh.jpg" width="40" height="40" >',
    "disguy": '<img src="http://i.imgur.com/QbPMBnT.jpg" width="50" height="50" >',
    "applause": '<img src="http://i.imgur.com/zU4MWxt.gif" width="50" height="50" >',
    "like": '<img src="http://i.imgur.com/LoiLTWx.png" width="30" height="30" >',
    "notsure": '<img src="http://i.imgur.com/NaJOipw.jpg" width="50" height="50" >',
    "gir": '<img src="http://i.imgur.com/RQDcT0t.gif" width="50" height="50" >',
    "bogs": '<img src="http://i.imgur.com/NHWMFAV.png" width="27.2" height="40">',
    "de": '<img width="35" height="35" src="http://i.imgur.com/SPlADEN.gif"></img>',
    "merica": '<img width="35" height="58" src="http://i.imgur.com/slU5Ibx.gif"></img>',
    "sad": '<img width="40" height="50" src="http://i.imgur.com/WGVec1g.png"></img>',
    "feelsbadman": '<img width="55" height="55" src="http://i.imgur.com/D5Pb9CK.png"></img>',
    "kekefeels": '<img width="45" height="58" src="http://i.imgur.com/fjnKFla.jpg"></img>',
    "haveaseat": '<img width="60" height="52" src="http://i.imgur.com/0YH5oDz.jpg"></img>',
    "glad": '<img src="http://i.imgur.com/OzoGMzC.jpg" width="45" height="50">',
    "foreverfedora": '<img src="http://i.imgur.com/rPd1rF4.png" width="30" height="40">',
    "lefunnymeme": '<img src="http://i.imgur.com/LLXMuJ1.jpg" width="50" height="45">',
    "metal": '<img src="http://i.imgur.com/7Zpq3i9.gif" width="45" height="55">',
    "wat": '<img src="http://i.imgur.com/CALcK.png" width="38" height="42">',
    "goyim": '<img src="http://i.imgur.com/zg7DE.gif" width="50" height="58">',
    "bender": '<img src="http://i.imgur.com/AAulUfx.gif" width="50" height="50">',
    "kidzbop": '<img src="http://i.imgur.com/lMNHVOi.gif" width="50" height="60">',
    "monkey": '<img src="http://i.imgur.com/f8QbyJk.gif" width="45" height="55">',
    "thuglife": '<img src="http://i.imgur.com/FhdArn4.gif" width="55" height="55">',
    "mysides": '<img src="http://i.imgur.com/Gg1asUN.gif" width="50" height="45">',
    "bardy": '<img src="http://i.imgur.com/C7jqbVR.gif" width="50" height="65">',
    "jimmy": '<img src="http://i.imgur.com/0gRnsme.jpg" width="45" height="55">',
    "2slow": '<img src="http://i.imgur.com/eKMaWME.jpg" width="59" height="45">',
    "feelsgoodman": '<img src="http://i.imgur.com/BZ3WF.png">',
    "bear": '<img src="http://i.imgur.com/JVbAzkh.gif" width="35" height="58">',
    "ded": '<img src="http://i.imgur.com/3Nzl3gQ.gif" width="50" height="63">',
    "nice": '<img src="http://i.imgur.com/UsUdb.png" width="60" height="60">',
    "doge": '<img src="http://i.imgur.com/93FIGRJ.gif" width="60" height="60">',
    "feels": '<img src="http://i.imgur.com/3d9rVYL.gif" width="55" height="60">',
    "mewte": '<img src="http://i.imgur.com/aHk0nnU.gif" width="60" height="45">',
    "boogie": '<img width="60" height="60" src="http://i.imgur.com/6aqGVba.gif"></img>',
    "disco": '<img width="46" height="60" src="http://i.imgur.com/DaUdTh0.gif"></img>'
};