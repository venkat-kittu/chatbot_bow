let apiurl = "upload_photos_1";
$(document).ready(function () {
    const _this = this;
    // let i=1;
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {

            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                //    $( "#bot_typing" ).before( $message );
                $('.messages').append($message);

                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };


    // $(function () {
    var getMessageText, message_side, sendMessage;
    message_side = 'right';
    getMessageText = function () {
        var $message_input;
        $message_input = $('.message_input');
        const val = $message_input.val();
       // $message_input.val('');
        console.log(val);
        return val;
    };
    sendMessage = function (text, user) {
        var $messages, message;
        if (text === '') {
            return;
        }
        // $('.message_input').val('');
        $messages = $('.messages');

        if (user == null || user != 'bot')
            message_side = 'right';
        else
            message_side = 'left';

        // message_side = message_side === 'left' ? 'right' : 'left';

        message = new Message({
            text: text,
            message_side: message_side
        });
        message.draw();
        return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
    };
    $('.send_message').click(function (e) {
        sendMessage(getMessageText());
        chat(getMessageText())
        $('.message_input').val('');
        return;

    });
    $('.message_input').keyup(function (e) {
        if (e.which === 13) {
            sendMessage(getMessageText());
            chat(getMessageText())
            $('.message_input').val('');
            return;
        }
    });

    function chat(input) {
        //alert(input);  
        // $('#bot_typing').show();


        if (input === '')
            return
        var addData = {
            "message": input
        };
        loading();
        console.log(addData);

        //Bot Reply
        //sendMessage('Hi','bot');

        /////////////// CHATBOT   //////////////
        $.ajax({
            type: "POST",
            url: "/chat",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(addData),
            success: function (result) {
                console.log(result);
                $('#bot_typing').remove();
                sendMessage(result.message, 'bot');
                $('.message_input').val('');

            },
            error: function (error) {
                //alert(error);
                console.log(error);
                $('#bot_typing').remove();
                sendMessage('Server Down', 'bot');
            }
        });

    }

    $('.minimize').on('click', function () { minimize(); });
    $('.maximize').on('cliick', function () { maximize(); });

    function minimize() {
        $('body').addClass('minimized');
    }

    function maximize() {
        $('body').removeClass('minimized');
    }


    setTimeout(function () {
        sendMessage("Hello, I am your Insurance bot", 'bot');
        return sendMessage('Upload car images in order like <br />1) car front/back photo with number plate\n2)damaged car photo', 'bot');
    }, 1000);


    //APPENDING TYPING
    function loading() {
        var loader = '<li class="message left appeared" id="bot_typing" > <div class="avatar">  </div> <img src="image/loading.gif" style="width:10%;left:5%;position:absolute"> </li>';
        $('.messages').append(loader);

        $('.messages').animate({ scrollTop: $('.messages').prop('scrollHeight') }, 300)
    }

    // });


    $('#multiFiles').on('change', function () {

        var form_data = new FormData();
        var ins = document.getElementById('multiFiles').files.length;
        for (var x = 0; x < ins; x++) {
            form_data.append("files[]", document.getElementById('multiFiles').files[x]);
        }
        uploadFiles(form_data);
    });

    function uploadFiles(formData) {
        $.ajax({
            url: apiurl,
            method: 'post',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function () {
                loading();
                var xhr = new XMLHttpRequest();
                // alert('Hi');
                // Add progress event listener to the upload.
                xhr.upload.addEventListener('progress', function (event) {




                    //progression bar temp
                    var progressBar = $('.progress-bar');

                    if (event.lengthComputable) {
                        var percent = (event.loaded / event.total) * 100;
                        progressBar.width(percent + '%');

                        if (percent === 100) {
                            progressBar.removeClass('active');
                        }
                    }
                });

                return xhr;
            }
        }).done(handleSuccess).fail(function (xhr, status) {
            $('#bot_typing').remove();
            alert("Please Try Again Later");
        });

        function regcheck(car_number,photos){
           
            $.ajax({
                type: "POST",
                url: "/reg_check",
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({newnumber: car_number,photos:photos}),
                processData: false,
                xhr: function () {
                    loading();
                    var xhr = new XMLHttpRequest();
                    return xhr;
                }
            }).done(handleSuccess).fail(function (xhr, status) {
                $('#bot_typing').remove();
                alert("Please Try Again Later");
            });
         

        }

        function handleSuccess(data) {
            var story = "";
            $('#bot_typing').remove();
            console.log(data);
            data = typeof data == 'object' ? data : JSON.parse(data);
            var temp_data = typeof data.message =='object' ? data.message : JSON.parse(data.message)
            if (apiurl === "upload_photos_1") {
                var x = confirm("Your registration number detected as " + temp_data.car_number + " if it is wrong enter in next popup");
                console.log(x);
                if (!x) {
                    // Reset the image
                    var person = prompt("Please enter your Registration number: ");
                    if (person == null || person == "") {
                        //data.message.car_number;
                    } else {
                        temp_data.car_number = person;
                        regcheck(person,data.photos);
                        return
                    }
                }
                story = "Your car number is " + temp_data.car_number + " model is " + temp_data.model + " with company " + temp_data.company+" regitered in "+temp_data.reg_year;
            }
            if (apiurl === "upload_photos_2") {
                story = "your damage part is " + temp_data.part + " estimated cost is " + temp_data.cost;
            }
            apiurl = data.apiurl;
            if (data.photos.length > 0) {
                var html = '';
                for (var m = 0; m < data.photos.length; m++) {
                    var img = data.photos[m];

                    if (img.status) {
                        console.log("came here");
                        html += '<div class="col-xs-6 col-md-4"><a href="#" class="thumbnail"><img src="' + img.publicPath + '" alt="' + img.filename + '"></a>       </div>';

                    } else {
                        html += '<div class="col-xs-6 col-md-4"><a href="#" class="thumbnail">Invalid file type - ' + img.filename + '</a></div>';
                    }
                }
                imagesample(html);
                sendMessage(story, 'bot');

                $('.progress-bar').width('0%');
                // sendMessage(data.message,'bot');

                //  $('#album').html(html);
            } else {
                alert('No images were uploaded.')
            }
        }
        function imagesample(text) {

            $message = $($('.message_template').clone().html());
            $message.addClass('left').find('.text').html(text);
            $('.messages').append($message);

            $message.addClass('appeared');
            $('.messages').animate({ scrollTop: $message.prop('scrollHeight') }, 300);
        }

    }

});