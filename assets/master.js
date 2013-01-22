;(function($) {

  $.desknoty = function(options) {

    var defaults = {
      icon: null,
      title: "",
      body: "",
      timeout: 5000,
      sticky: false,
      id: null,
      type: 'normal',
      url: '',
      dir: '',
      onClick: function() {},
      onShow: function() {},
      onClose: function() {},
      onError: function() {}
    }

    var p = this, noti = null;

    p.set = {}

    var init = function() {
      p.set = $.extend({}, defaults, options);
      if(isSupported()) {
        if(window.webkitNotifications.checkPermission() != 0){
          getPermissions(init);
        } else {
          if(p.set.type === 'normal') createNoti();
          else if(p.set.type === 'html') createNotiHtml();
        }
      } else {
        // alert("Desktop notifications are not supported!");
      }
    }

    var createNoti = function() {
      noti = window.webkitNotifications.createNotification(p.set.icon, p.set.title, p.set.body);
        if(p.set.dir) noti.dir = p.set.dir;
        if(p.set.onclick) noti.onclick = p.set.onclick;
        if(p.set.onshow) noti.onshow = p.set.onshow;
        if(p.set.onclose) noti.onclose = p.set.onclose;
        if(p.set.onerror) noti.onerror = p.set.onerror;
        if(p.set.id) noti.replaceId = p.set.id;
      noti.show();
      if(!p.set.sticky) setTimeout(function(){ noti.cancel(); }, p.set.timeout);
    }
    var createNotiHtml = function() {
      noti = window.webkitNotifications.createHTMLNotification(p.set.url);
        if(p.set.dir) noti.dir = p.set.dir;
        if(p.set.onclick) noti.onclick = p.set.onclick;
        if(p.set.onshow) noti.onshow = p.set.onshow;
        if(p.set.onclose) noti.onclose = p.set.onclose;
        if(p.set.onerror) noti.onerror = p.set.onerror;
        if(p.set.id) noti.replaceId = p.set.id;
      noti.show();
      if(!p.set.sticky) setTimeout(function(){ noti.cancel(); }, p.set.timeout);
    }

    var isSupported = function() {
      if (window.webkitNotifications)return true;
      else return false;
    }
    var getPermissions = function(callback) {
      window.webkitNotifications.requestPermission(callback);
    }
    init();
  }
})(jQuery);


/*!
 * Title Alert 0.7
 *
 * Copyright (c) 2009 ESN | http://esn.me
 * Jonatan Heyman | http://heyman.info
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */
(function(a) {
    a.titleAlert = function(e, c) {
        if(a.titleAlert._running) {
            a.titleAlert.stop()
        }
        a.titleAlert._settings = c = a.extend({}, a.titleAlert.defaults, c);
        if(c.requireBlur && a.titleAlert.hasFocus) {
            return
        }
        c.originalTitleInterval = c.originalTitleInterval || c.interval;
        a.titleAlert._running = true;
        a.titleAlert._initialText = document.title;
        document.title = e;
        var b = true;
        var d = function() {
                if(!a.titleAlert._running) {
                    return
                }
                b = !b;
                document.title = (b ? e : a.titleAlert._initialText);
                a.titleAlert._intervalToken = setTimeout(d, (b ? c.interval : c.originalTitleInterval))
            };
        a.titleAlert._intervalToken = setTimeout(d, c.interval);
        if(c.stopOnMouseMove) {
            a(document).mousemove(function(f) {
                a(this).unbind(f);
                a.titleAlert.stop()
            })
        }
        if(c.duration > 0) {
            a.titleAlert._timeoutToken = setTimeout(function() {
                a.titleAlert.stop()
            }, c.duration)
        }
    };
    a.titleAlert.defaults = {
        interval: 500,
        originalTitleInterval: null,
        duration: 0,
        stopOnFocus: true,
        requireBlur: false,
        stopOnMouseMove: false
    };
    a.titleAlert.stop = function() {
        clearTimeout(a.titleAlert._intervalToken);
        clearTimeout(a.titleAlert._timeoutToken);
        document.title = a.titleAlert._initialText;
        a.titleAlert._timeoutToken = null;
        a.titleAlert._intervalToken = null;
        a.titleAlert._initialText = null;
        a.titleAlert._running = false;
        a.titleAlert._settings = null
    };
    a.titleAlert.hasFocus = true;
    a.titleAlert._running = false;
    a.titleAlert._intervalToken = null;
    a.titleAlert._timeoutToken = null;
    a.titleAlert._initialText = null;
    a.titleAlert._settings = null;
    a.titleAlert._focus = function() {
        a.titleAlert.hasFocus = true;
        if(a.titleAlert._running && a.titleAlert._settings.stopOnFocus) {
            var b = a.titleAlert._initialText;
            a.titleAlert.stop();
            setTimeout(function() {
                if(a.titleAlert._running) {
                    return
                }
                document.title = ".";
                document.title = b
            }, 1000)
        }
    };
    a.titleAlert._blur = function() {
        a.titleAlert.hasFocus = false
    };
    a(window).bind("focus", a.titleAlert._focus);
    a(window).bind("blur", a.titleAlert._blur)
})(jQuery);


// jQuery-typing
//
// Version: 0.2.0
// Website: http://narf.pl/jquery-typing/
// License: public domain <http://unlicense.org/>
// Author:  Maciej Konieczny <hello@narf.pl>
(function(f){function l(g,h){function d(a){if(!e){e=true;c.start&&c.start(a,b)}}function i(a,j){if(e){clearTimeout(k);k=setTimeout(function(){e=false;c.stop&&c.stop(a,b)},j>=0?j:c.delay)}}var c=f.extend({start:null,stop:null,delay:400},h),b=f(g),e=false,k;b.keypress(d);b.keydown(function(a){if(a.keyCode===8||a.keyCode===46)d(a)});b.keyup(i);b.blur(function(a){i(a,0)})}f.fn.typing=function(g){return this.each(function(h,d){l(d,g)})}})(jQuery);

//////Master begins from here
var socket, $_hasFocus = true,
  last_msgr = '',
  last_msg;

// var h2h=location.hostname+":3001";
var h2h="http://heartohelp.us"+":3001";


function loadCount() {
  // if($_hasFocus)
    $.getJSON(h2h+'/status', function(data) {
    $("#listener").text('(' + data.listener + ')');
    $("#venter").text('(' + data.venters + ')');
  });
}

loadCount();
var myVar = setInterval(loadCount, 20000);


$("#add_venter,#add_listner").click(function() {
  process_sock(this.id);
  $(this).find('button').hide();
  $(this).siblings().fadeOut();
});

function process_sock(a) {


  var dbl_msg="";
  clearInterval(myVar);
  socket = io.connect(h2h);
  socket.on('connect', function() {
    socket.emit(a);
  });

  socket.on('updatechat', function(id, data) {

    if(last_msgr != id) {

      if(dbl_msg==data) return 0;
      else dbl_msg=data;

      last_msgr = id;
      var cass = id == "Venter" ? "right" : "left";
      last_msg = $('<div class="popover ' + cass + '"><div class="arrow"></div><div class="popover-content"><p>' + data + '</p></div></div>').appendTo('#conversation');
    }
    else
    $('<hr><p>' + data + '</p>').appendTo(last_msg);

    $('#conversation').scrollTop($("#conversation")[0].scrollHeight);
    $('#' + id + '_t').addClass('vh');
    cpNotification(id, data);
  });

  socket.on('starttypin', function(id) {
    $('#' + id + '_t').removeClass('vh');
  });

  socket.on('stoptypin', function(id) {
    $('#' + id + '_t').addClass('vh');
  });

  socket.on('SERVER', function(msg) {
    $('<div class="popover"><div class="popover-content"><p>'+msg+'</p></div></div>').appendTo('#conversation');
    cpNotification('SERVER', msg);
  });


  socket.on('all_connected', function() {
    $("#buttons").fadeOut('slow', function() {
      $("#chat_box").fadeIn();
    });
  });

socket.on('disc', function(id) {
    $('#' + id + '_s,#' + id + '_t').addClass('vh');
    $('<div class="popover"><div class="popover-content"><p><a href="http://www.heartohelp.us/forum/missed-connections/" target="_blank">Post a Missed Connection</a>.<br></p></div></div>').appendTo('#conversation');

  });

socket.on('whoami', function(id) {
      $('#'+id+'_t').html('<span class="label label-'+(id == "Venter" ? "success" : "warning")+'">ME</span>').removeClass('vh').attr('id','me');
  });


  $('#data').keydown(function(e) {

    if(e.keyCode == 13 && !e.shiftKey) {

      e.preventDefault();
      var message = $('#data').val();
      $('#data').val('').focus();

      socket.emit('sendchat', message);
    }
  }).typing({
    start: function() {
      socket.emit('starttyping');
    },
    stop: function() {
      socket.emit('stoptyping');
    },
    delay: 1000
  });

}



var html5_audiotypes = {
  "mp3": "audio/mpeg",
  "mp4": "audio/mp4",
  "ogg": "audio/ogg",
  "wav": "audio/wav"
}

function createsoundbite(sound) {
  var html5audio = document.createElement('audio')
  if(html5audio.canPlayType) {
    for(var i = 0; i < arguments.length; i++) {
      var sourceel = document.createElement('source')
      sourceel.setAttribute('src', arguments[i])
      if(arguments[i].match(/\.(\w+)$/i)) sourceel.setAttribute('type', html5_audiotypes[RegExp.$1])
      html5audio.appendChild(sourceel)
    }
    html5audio.load()
    html5audio.playclip = function() {
      html5audio.pause()
      html5audio.currentTime = 0
      html5audio.play()
    }
    return html5audio
  } else {
    return {
      playclip: function() {
        throw new Error("Your browser doesn't support HTML5 audio unfortunately")
      }
    }
  }
}

var sound = createsoundbite("assets/DingLing.wav", "assets/DingLing.mp3");


function cpNotification(a, b) {
  if(!$_hasFocus) {
    $.desknoty({
      icon: "",
      title: a,
      body: b
    });
    sound.playclip();
    // sound.clipsInterval = setInterval(sound.playclip, 15000);
    sound.playclip();
    $.titleAlert(a + ': New message');
  }

}


$(window).focus(function() {
  // clearInterval(sound.clipsInterval);
  $_hasFocus = true;
}).blur(function() {
  $_hasFocus = false;
});