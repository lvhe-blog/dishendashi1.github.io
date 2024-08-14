regsiter_loadded = true;

var rule_email = {
    required: true,
    email: true,
    remote: {
        url: '/user/checkemail',
        type: 'POST',
    }
};
var message_email = {
    required: '请输入邮件地址',
    email: '邮件地址无效',
    remote: '该邮件地址已被占用',
};
var rule_phoneno = {
    required: true,
    minlength: 11,
    isMobile: true,
    remote: {
        url: '/user/checkphoneno',
        type: 'POST',
    }
};
var message_phoneno = {
    required: '请输入手机号码',
    minlength: '手机号码长度错误，目前只接受中国大陆11位手机号码',
    isMobile: '请正确填写您的手机号码',
    remote: '手机号码已经被注册',
};
var rule_smscode = {
    required: true
};
var message_smscode = {
    required: '请输入短信验证码'
};

var rule_captcha = {
    required: true,
};

var message_captcha = {
    required: '请输入图形验证码'
};

var validate_exp = {
    rules: {
        nickname: {
            required: true,
            maxlength: 10,
            specialchar: true,
            remote: {
                url: '/user/checknickname',
                type: 'POST',
            }
        },
        password: {
            required: true,
            rangelength: [8, 16]
        },
        confirm_password: {
            required: true,
            equalTo: '#password'
        },
        qq: {
            digits: true
        }
        //- spam: 'required'
    }, //end rules
    messages: {
        nickname: {
            required: '请输入昵称',
            maxlength: '昵称长度不能大于10个字符',
            specialchar: '昵称含有非法字符',
            remote: '此昵称无法使用',
        },

        password: {
            required: '请输入密码',
            rangelength: '密码长度需要为8-16个字符'
        },
        confirm_password: {
            required: '请输入确认密码',
            equalTo: '两次输入的密码不一致'
        },
        qq: {
            digits: '请输入数字形式的QQ号码'
        }
    }, //end messages
    highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
    },
    submitHandler: function(form) {
        $('.loader').css('display', 'inline-block');
        $('.btnSubmit').prop('disabled', true);
        var is_sms = ($(form).find('#register_type').val() == 'sms');
        $.ajax({
            type: 'post',
            url: '/user/register',
            data: $(form).serialize(),
            success: function(data) {
                $('.loader').css('display', 'none');
                $('.btnSubmit').prop('disabled', false);
                $('#captchaimg_' + (is_sms) ? 'true' : 'false').click();
                if (data.result) {
                    if (data.type === 0) {

                        if (onCloseAllModel) {
                            onCloseAllModel();
                        }

                        $('#email_sent').modal('show');


                    } else if (data.type == 1) {
                        if (onCloseAllModel) {
                            onCloseAllModel();
                        }
                        $('#username').html(data.user.nickname);
                        $('#register_success').modal('show');
                    }
                } else {
                    $('.loader').css('display', 'none');
                    $('.btnSubmit').prop('disabled', false);
                    $('#captchaimg_' + (is_sms) ? 'true' : 'false').click();
                    var errs = {};
                    for (var i = 0; i < data.errors.length; i++) {
                        var err = data.errors[i];
                        errs[err.param] = err.msg;
                    }
                    var validator;
                    if (is_sms) {
                        validator = phone_validator;
                    } else {
                        validator = email_validator;
                    }
                    validator.showErrors(errs);
                }
            }
        });
        return false;
    }
};

function getEmailWebsite(email) {
    var tail = email.substr(email.indexOf('@') + 1);
    var site = tail.substr(0, tail.indexOf('.'));
    if (site == 'gmail')
        return tail;
    else
        return 'mail.' + tail;
}

var validCode = true;



function getsmscode_click(phno, cptch, getsms, img, validator) {
    return function() {
        if (phno.valid()) {
            var captcha = cptch.val();
            var phoneno = phno.val();
            if (captcha.length != 4) {
                validator.showErrors({
                    'captcha': '请输入正确的图形验证码'
                });
            } else {
                getsms_(captcha, phoneno, img, validator, getsms);
            }
        }
    };
}

function InitRegisterValidator() {
    jQuery.validator.addMethod("isMobile", function(value, element) {
        var length = value.length;
        var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
        return this.optional(element) || (length == 11 && mobile.test(value));
    }, "请正确填写您的手机号码");
    jQuery.validator.addMethod(
        "specialchar",
        function(value, element) {
            var re = new RegExp("[%\\-`~!@#$^&*\\(\\)=\\|{}<>]");
            return this.optional(element) || !re.test(value);
        },
        "输入含有非法字符."
    );
    //- regex:"^[%--`~!@#$^&*()=|{}\':;,\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“。，、？]",

    validate_exp.rules.phoneno = rule_phoneno;
    validate_exp.messages.phoneno = message_phoneno;
    validate_exp.rules.smscode = rule_smscode;
    validate_exp.messages.smscode = message_smscode;
    validate_exp.rules.confirm_password.equalTo = '#passwordsms';

    phone_validator = $('#FormPhoneRegister').validate(validate_exp);
    delete validate_exp.rules.phoneno;
    delete validate_exp.messages.phoneno;
    delete validate_exp.rules.smscode;
    delete validate_exp.messages.smscode;

    validate_exp.rules.email = rule_email;
    validate_exp.messages.email = message_email;
    validate_exp.rules.captcha = rule_captcha;
    validate_exp.messages.captcha = message_captcha;
    validate_exp.rules.confirm_password.equalTo = '#password';

    email_validator = $('#FormEmailRegister').validate(validate_exp);


    $('#getsmscode').off().on('click', getsmscode_click($('#phonenoPhoneRegister'), $('#captcha_true'), $('#getsmscode'), $('#captchaimg_true'), phone_validator));
}

RunOnReady(function() {

    $('#FormPhoneRegister').focusin(function() {
        if (!$('#captchaimg_true').attr('src'))
            $('#captchaimg_true').attr('src', '/user/captcha');
    });
    $('#FormEmailRegister').focusin(function() {
        if (!$('#captchaimg_false').attr('src'))
            $('#captchaimg_false').attr('src', '/user/captcha');
    });

    // if (!ie678())
    $.getScript('/bower_components/distpicker/dist/distpicker.min.js');
    if (!$.validator)
        $.getScript('/bower_components/jquery-validation/dist/jquery.validate.min.js').done(InitRegisterValidator);
    else
        InitRegisterValidator();
}); //end ready

//# sourceURL=register.js