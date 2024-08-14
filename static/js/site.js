var onload_called = false;
var document_ready_cbs = [];

function loadscript(src, cb) {
    var myScript = document.createElement('script');
    myScript.src = src;
    myScript.onload = cb;
    if (typeof cb === "function") {
        myScript.onreadystatechange = function() {
            var r = myScript.readyState;
            if (r === 'loaded' || r === 'complete') {
                myScript.onreadystatechange = null;
                cb();
            }
        };
    }
    document.getElementsByTagName('head')[0].appendChild(myScript);
}

function RunOnReady(cb) {
    if (!onload_called)
        document_ready_cbs.push(cb);
    else
        cb();
}

function loadProfile(profile) {
    //- if (profile.Avatar) {
    //-   $('#user-img').attr('src', profile.Avatar);
    //- }
    //- $('#btnLogin').css('display', 'none');
    //- $('#btnLogin').unbind('click');
    //- //- $('#btnLogin').attr('href', '#');
    //- $('#usericon').attr('data-toggle', 'popover');
    //- $('#usericon').attr('data-placement', 'left');
    //- $('#usericon').attr('title', profile.NickName);
    //- $('#usericon').attr('data-popover-content', "#popovermenu");
    //- if (profile.admin) {
    //-   $('<li><a href="/admin">管理</a></li>').insertBefore($('#liquit'));
    //- }
}

function isWechat() {
    return navigator.userAgent.indexOf('MicroMessenger') !== -1;
}



function on_notify_click(url) {
    parent.focus();
    window.focus();
    if (document.location.toString().indexOf('/user') === -1)
        window.open(url, "_self");
    else {
        $('.nav-tabs a[href="#sitemsg"]').tab('show');
        if (typeof retrieve != 'undefined')
            retrieve();
    }
    $.post('/sitemsg/clearnotify', function() {});
}

function get_h5_notify_click(url) {
    return function() {
        on_notify_click(url);
    };
}



function get_sitemsg_notify(cb) {
    if (document.location.toString().indexOf('#sitemsg') == -1) {
        $.get('/sitemsg/notify', function(data) {
            if (data.result) {
                if (data.count > 0) {
                    //TODO:update message bage count//unread_site_message_count = data.count;
                    $('.unreadcount').html(data.count);
                    var notify_body = '您有' + data.count + '条未读消息';
                    if (!notifyMe('通知', '/static/images/LOGO.png', notify_body, '/user#sitemsg')) {
                        bootstrap_alert.show('<span class="glyphicon glyphicon-envelope"/>&nbsp;<a href="/user#sitemsg" onclick="on_notify_click(this.href);">' + notify_body + '</a>', 'warning', 15000);

                        $('#floating_alert .close').click(function() {
                            $.post('/sitemsg/clearnotify', function(data) {});
                        });
                    }
                    if (cb)
                        cb(data.count);
                }
            }
        });
    }
}

var bs_onload_called = false;
var bs_ready_cbs = [];

function OnBootStrapReady(cb) {
    if (!bs_onload_called)
        bs_ready_cbs.push(cb);
    else
        cb();
}


function onClickLogin(e) {
    $('#LoginRegiterModal').modal('show');
    e.preventDefault();
}

function getsms_(captcha, phoneno, img, validator, btnGetsms) {
    $.post('/user/getsmscode', {
        captcha: captcha,
        phoneno: phoneno
    }, function(result) {
        if (!result.success) {
            img.click();
            validator.showErrors(result.errors);
        } else {
            var time = 60;
            var code = btnGetsms;
            if (validCode) {
                validCode = false;
                code.prop('disabled', true);
                var t = setInterval(function() {
                    time--;
                    code.html(time + "秒后重新获取");
                    if (time === 0) {
                        clearInterval(t);
                        code.html("重新获取短信验证码");
                        validCode = true;
                        code.prop('disabled', false);
                    }
                }, 1000);
            }
        }
    });
}

function ie678() {
    return !-[1, ] && document.documentMode;
}

var logged_in = false;

var jquery = ie678() ? sc + '/static/javascripts/jquery-1.12.1.min.js' : sc + '/bower_components/jquery/dist/jquery.min.js';

loadscript(jquery, function() {
    $.ajaxSetup({
        cache: true
    });
    $.getScript(sc + '/bower_components/bootstrap/dist/js/bootstrap.min.js').done(function() {
        for (var i = 0; i < bs_ready_cbs.length; i++) { bs_ready_cbs[i](); }
        bs_onload_called = true;

        $('.carousel').carousel({
            interval: 8000
        });

    });
    $(document).ready(function() {


        //logic about the fixtop nav
        var adjustTopFunc = function() {
            if ($('.datenav') != null) {
                var $nav = $(".fixtopnav");
                var offset = $('.datenav').height() - $(this).scrollTop();

                if (offset >= 0)
                    $nav.css('top', offset);
                else
                    $nav.css('top', 0);
                //$nav.toggleClass('fixtop', enable);
            }
        };
        $(document).scroll(adjustTopFunc);

        adjustTopFunc();

        //subnav mouse events

        $('.navb li').mouseover(function() {
            $('.subnav').css('display', 'block');

            //clear other first
            $('.subnav .content_box').children().css('display', 'none');
            $('.subnav .content_box').children().eq($(this).index()).css('display', 'flex');

            //put triangle below focused element
            $('.triangle').css('display', 'none');
            var li = $('.navb ul').children().eq($(this).index())
            
            if (li.find('.triangle')[0])
                li.find('.triangle').css('display', 'block');
            else
                li.append('<div class="triangle" />');
        });
        $('.navb li').mouseout(function(e) {
                if (e.offsetY > 0 && e.offsetY > 100) {
                    $('.subnav').css('display', 'none');
                    $('.triangle').css('display', 'none');
                    // set subnav menu according to main nav item
                   //$('.subnav .content_box').children().css('display', 'none');
                    //$('.subnav .content_box').children().eq($(this).index()).css('display', 'none');
                }
        });
        $('.subnav').mouseover(function() {
            
            $('.subnav').css('display', 'block');
        });
        $('.subnav').mouseout(function() {
            $('.subnav').css('display', 'none');
            //$('.subnav .content_box').children().eq($(this).index()).css('display', 'none');
        });

        $('.navbar-nav>li>a, .navbar-nav>li>img').click(function() {
            
            //$('.navbar-nav li').removeClass('active');
            $(this).parent().toggleClass('active'); //find('.subnav').
        });

        $('#listmore').click(function() {
            var obj = $(this);
            var next_page = obj.attr('nextpage');
            var gettype = function(exptype) {
                if (window.location.pathname.indexOf(exptype) != -1)
                    return exptype;
                else
                    return null;
            };
            var type = gettype('text') || gettype('audio') || gettype('video') || gettype("poem") ;
            var headstyle = (type == 'text')?'':type + '_list';
            $.get('?ajax=1&page=' + next_page, function(data) {
                if (data.success == 1) {
                    data[type + 's'].forEach(element => {
                        var item = $('<section class="text_list_item"><div class="text_item_head ' + headstyle + '"><div class="text_item_head_data"><h3><a href="/' + type + '/' + element._id + '">' + element.Title + '</a></h3></div></div></section>');
                        item.insertBefore($('#listmore'));
                    });

                    obj.attr('nextpage', parseInt(next_page) + 1);
                } else {

                    $('#listmore').hide();
                }
            });
        });

        // set current navigation item style
        $('.triangle').remove();
        $('.navb ul').children().eq(cur_nav_index).append('<div class="triangle"/>');

        // reset subnav status
        $('.subnav .content_box').children().css('display', 'none');


        $('#loginRegister').click(function(e) {
            if ($(".avatarIco").attr('src') !== '/static/images/xms_user.png') { //user logged in
                $('#useraction_dropdown_menu').toggleClass('useraction-dropdown-menu-open')
            }
            else
                onClickLogin(e);
        });

        $('#bookmarkme').click(function() {
            if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
                window.sidebar.addPanel(document.title, window.location.href, '');
            } else if (window.external && ('AddFavorite' in window.external)) { // IE Favorite
                window.external.AddFavorite(location.href, document.title);
            } else if (window.opera && window.print) { // Opera Hotlist
                this.title = document.title;
                return true;
            } else { // webkit - safari/chrome
                alert('请按 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 键将本页加入收藏');
            }
        });

        var ua = navigator.userAgent;
        var isAndroid = ua.indexOf('android') > -1 || ua.indexOf('Android') > -1;

        //if (isAndroid) {
            //$('#openwithapp').text('在APP中打开');
        //}

        $('#openwithapp').click(function(e) {
            e.preventDefault();
               
                //alert(schemeUrl);
                var loadTime = new Date();
                window.location.href = $('#openwithapp').attr('href');
                setTimeout(function() {
                    var outTime = new Date()
                    if (outTime - loadTime > 1200){
                        window.location.href = '/downloadapp';
                    }           
                },2000);
            
            
            //    window.location.href = '/downloadapp';
            
        });

        // $(".fade-inout").each(function() {
        //     loop_fade($(this));
        // });

        for (var i = 0; i < document_ready_cbs.length; i++) { document_ready_cbs[i](); }
        onload_called = true;


        var profile = localStorage.getItem("LOCAL_PROFILE");
        if (profile)
            loadProfile(JSON.parse(profile));

        var timer;
        var fgetnotify = function(disable_timer) {
            get_sitemsg_notify(function(count) {
                if (count !== -1) {
                    if (!disable_timer)
                        timer = setInterval(get_sitemsg_notify, 10000);
                }
            });
        };
        fgetnotify(true);
        $.getScript(sc + '/bower_components/jquery-visibility/jquery-visibility.min.js').done(function() {
            if ($.support.pageVisibility) {
                $(document).on({
                    'show': fgetnotify,
                    'hide': function() {
                        if (timer)
                            clearInterval(timer);
                    }
                });
            } else {
                fgetnotify(false);
            }
        });

        $('#loginform').on('login', function(event, user) {
            logged_in = true;
        });

        $.post('/counter/page', { title: document.title, location: location.pathname }, function(data) {
            if (data.success) {
                var counterelem = $('#readCount');
                if (counterelem)
                    counterelem.html(data.count);

                if (data.user) {
                    logged_in = true;
                    $(".avatarIco").attr('src', data.user.Avatar);

                    //set info
                    $('#userinfo').html('<a class="navuser" href="/user">欢迎你：' + data.user.NickName + '</a><a class="logout" href="/user/logout">退出</a>');
                }
                if (data.user) {
                   localStorage.setItem("LOCAL_PROFILE", JSON.stringify(data.user));
                   loadProfile(data.user);
                }
                if (data.StorageVer) {
                    
                    StorageVer = data.StorageVer
                }
            }
        });

        $('#loginRegister').click(function(e) {
            var content = $('#login_register').html();
            var isMobile = /Mobi/.test(navigator.userAgent);
            var localVer = localStorage.getItem('LOCAL_LOGIN_REG_CODE_VER');
            var expired = (StorageVer && localVer) ? (StorageVer > localVer) : true;

            if (!isMobile && !content && !$('#loginform').length) {
                var code = localStorage.getItem("LOCAL_LOGIN_REG_CODE");
                if (!code || expired) {
                    $.ajax({
                        type: 'GET',
                        async: true,
                        url: '/login_register',
                        cache: false,
                        success: function(hdata) {
                            $('#login_register').html(hdata);
                            if (typeof(regsiter_loadded) == 'undefined')
                                $.getScript(sc + '/static/javascripts/register.js?v=13');
                            if (typeof(login_loadded) == 'undefined')
                                $.getScript(sc + '/static/javascripts/login.js?v=1');
                            $('#login_register').html(hdata);
                            
                            localStorage.setItem("LOCAL_LOGIN_REG_CODE", hdata);
                            localStorage.setItem("LOCAL_LOGIN_REG_CODE_VER", data.StorageVer);

                            $('#loginRegister').trigger(e);
                        }
                    });
                }else {
                    $('#login_register').html(code);
                    if (typeof(regsiter_loadded) == 'undefined')
                        $.getScript(sc + '/static/javascripts/register.js?v=13');
                    if (typeof(login_loadded) == 'undefined')
                        $.getScript(sc + '/static/javascripts/login.js?v=1');
                }
                
            }
            
        });

        //$.get('/notice/user_notice');

        $('#btnLogin').click(onClickLogin);

        $('#registerBtn').click(function() {
            $('#register').removeClass('fade');
            $('#register').addClass('active');
            $('#login').removeClass('active');
            $('#LoginRegiterModal').modal('show');

        });

        $('#MailContentForm').focusin(function() {
            if (!$('#ci').attr('src'))
                $('#ci').attr('src', '/user/captcha');
        });

        $('.ContactSiteMessage').click(function(e) {
            $.getScript(sc + '/static/javascripts/sitemessage.js?v=103').done(function() {
                $('#_type').val('chat');
                $('#ReferUrlGroup').hide();
                $('#_referurl').val('');
                $('#ScreenShotGroup').hide();
                $('#ScreenShotImg').attr('src', '');

                if (!logged_in) {
                    bootstrap_alert.show('<span class="glyphicon glyphicon-warning-sign"/>&nbsp;您尚未登陆，你所发送的站内信将无法获得管理员回复。如需获得回复，请您<b><a id="SiteMsgLoggedIn" href="#">登录</a></b>后再尝试发送站内信。', 'warning', 15000);
                    $('#SiteMsgLoggedIn').click(function(e) {
                        $('#MailContent').modal('hide');
                        bootstrap_alert.hide();
                        onClickLogin(e);
                        $('loginform').on('login', function(event, user) {
                            $('#LoginRegiterModal').modal('hide');
                            ShowNewMailDlg();
                            event.stopImmediatePropagation();
                        });

                        event.preventDefault();
                    });
                }

                ShowNewMailDlg();
            });
            e.preventDefault();
        });

        $('.reportBug').click(function(e) {
            $('#_type').val('bugreport');
            $('#ReferUrlGroup').show();
            $('#_referurl').val(window.location.href);
            $('#ScreenShotGroup').show();

            $.getScript(sc + '/bower_components/html2canvas/build/html2canvas.min.js').done(function() {
                $.getScript(sc + '/static/javascripts/sitemessage.js?v=103').done(function() {
                    html2canvas(document.body, {
                        allowTaint: true,
                        taintTest: false,
                        onrendered: function(canvas) {
                            canvas.id = "mycanvas";
                            var dataUrl = canvas.toDataURL('image/png');
                            $('#ScreenShotImg').attr('src', dataUrl);
                            ShowNewMailDlg('报告问题', '问题简述', '问题详细描述');
                            // var oPop = window.open(dataUrl, "", "width=1000,   height=500,   top=100,   left=0");
                        }
                    });


                });
            });
            e.preventDefault();
        });

        //mobile swip actions
        if (/Mobi/.test(navigator.userAgent)) {
            $.getScript(sc + '/bower_components/jquery-touch-events/src/jquery.mobile-events.min.js', function() {
                var cnt = $('.pc_main').length ? $('.pc_main') : $('.poem_main');
                cnt = (cnt.length) ? cnt : $('.text_content');
                cnt.on('swipeleft', function(event) {
                    if ($('.next>a').length)
                        window.location.href = $('.next>a').attr('href');
                    else if ($('#nextPage').length)
                        $('#nextPage').click();
                });
                cnt.on('swiperight', function() {
                    if ($('.pre>a').length)
                        window.location.href = $('.pre>a').attr('href');
                    else if ($('#prePage').length)
                        $('#prePage').click();
                });
            });
        }
        //search actions
        $('#searchButton, #searchbtn').click(function() {
            var search = $('#usersSearch').val() || $('.searchinput').val();
            if (search == '' && $('.searchinput').length >1)
                search = $('.searchinput')[1].value; 
            if (search) {
                //encode twice to avoid bad encodding problem
                window.location.href = "/search?q=" + encodeURIComponent(encodeURIComponent(search));
            }
            else {
                window.location.href = "/search";
            }
        })
        $('#usersSearch, .searchinput').keypress(function(e) {
            if (e.which == 13) { //Enter key pressed
                $('#searchButton, #searchbtn').click(); //Trigger search button click event
            }
        });
    });
    //});

});

bootstrap_alert = function() {};
bootstrap_alert.show = function(message, alert, timeout) {
    $('#alerttext').html(message);
    $alert = $('#floating_alert');
    $alert.addClass('alert-' + alert);
    $alert.css('display', 'block');
    //$alert.alert();
    setTimeout(function() {
        $alert.css('display', 'none');
        //- $alert.alert('close');
    }, timeout);
};

bootstrap_alert.hide = function() {
    $('#floating_alert').css('display', 'none');
};

function loop_fade(obj) {
    var text = obj.text();
    obj.html('');
    for (var i = 0; i < text.length; i++) {
        var $span = $(document.createElement('span'));
        $span.addClass('fade-in');
        $span.css('animation-delay', i / 4 + 's');
        var tx = text[i];
        if (tx == ' ')
            tx = '&nbsp;';
        $span.html(tx);
        obj.append($span);
    }

    setTimeout(function() {
        obj.empty();
        obj.html(text); //remove content
        obj.addClass('fade-out');

        setTimeout(function() {
            loop_fade(obj);
        }, 1000);
    }, 30 * 1000 / 4);
}

function getLocalProfile(callback) {
    var profileImgSrc = localStorage.getItem("PROFILE_IMG_SRC");
    var profileName = localStorage.getItem("PROFILE_NAME");
    var profileReAuthEmail = localStorage.getItem("PROFILE_REAUTH_EMAIL");
    if (profileReAuthEmail !== null && profileImgSrc !== null) {
        callback(profileImgSrc, profileName, profileReAuthEmail);
    }
}

function loadProfile() {
    if (!supportsHTML5Storage()) { return false; }
    getLocalProfile(function(profileImgSrc, profileName, profileReAuthEmail) {
        //changes in the UI
        $("#profile-img").attr("src", profileImgSrc);
        //$("#profile-name").html(profileName);
        $("#reauth-email").val(profileReAuthEmail);
        //$("#inputEmail").hide();
        $("#remember_me").hide();
    });
}

function supportsHTML5Storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

Date.prototype.Format = function(fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof Notification !== 'undefined') {
            if (Notification.permission !== "granted")
                Notification.requestPermission();
        }
    });
}


function notifyMe(title, icon, body, url) {
    if (typeof Notification !== 'undefined') {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
            return false;
        } else {
            var notification = new Notification(title, {
                icon: icon,
                body: body,
            });

            notification.onclick = get_h5_notify_click(url);

            notification.onclose = function() {
                $.post('/sitemsg/clearnotify', function(data) {});
            };

            return true;
        }
    }

    return false;
}


function onCloseAllModel() {
    $('#LoginRegiterModal').modal('hide');
}