(function(){
  var imgContent = null;  // global image reference, holding JQuery Image element from makeImgForModal
  var base_url = "https://lh3.googleusercontent.com/";  // googleusercontent scheme

  /**
   * [setImgInModal setting the fetched image in modal]
   */
  function setImgInModal(cnt){
    $('#rcontent').html(cnt);
  }

  /**
   * [clearModalContents empty the modal inputs and image placeholder]
   */
  function clearModalContents(){
    $('#imgUrl').val("");
    imgContent = null;
    setImgInModal("");
  }

  /**
   * [cleanUrl validating image fetch url]
   * @param  {[string]} img_url []
   * @return {[type]}         [full image url as absolute url]
   */
  function cleanUrl(img_url) {
    console.log("received uncleaned url: ", img_url);
    if( (img_url.length == 0) || (img_url.indexOf("https://www.")==0) || (img_url.indexOf("www")==0) ) { // check if url is empty, has www; to restrict for base_url scheme for now
      throw new Error("invalid url");
    } else if(img_url.indexOf(base_url)==0){
      if(img_url.length==base_url.length){ // only base url is given
        throw new Error("incomplete url, resource not given");
      }
    } else if(img_url.indexOf("/")==0){ // url prepended with '/', in case of relative/ absolute path to handle it(mischeif managed)
      img_url = img_url.substr(1, img_url.length);
      cleanUrl(img_url);  // recurivse check to this cleansed url
      img_url = base_url+img_url;
    } else { // url prepended with '/', in case of relative path to handle it
      img_url = base_url+img_url;
    }
    console.log("return clean url: ",img_url);
    return img_url;
  }

  /*
   desc - check required
   params - ID attribute of element
  */
  function validateRequired(ele){
    return ($(ele).val().trim().length == 0)? false: true;
  }

  /*
   desc - make errors for required checks
   params - ID attribute of element
  */
  function makeErrorMsg(ele, msg){
      $("<span />", {
        text: msg
      }).appendTo($("#"+ele).parent());
  }

  /**
   * [removeErrorMsg remove the associating error message HTMLElement]
   * @param  {[String]} ele [id of input field whose error message needs to be removed]
   * @return {[void]}     []
   */
  function removeErrorMsg(ele){
    var errMsg = $(ele).siblings("span");
    if(errMsg.length){
      errMsg.remove();
    }
  }

  /**
   * [validateElement validate an element for required condition]
   * @param  {[string]} ele [ID of the input element without '#']
   * @return {[void]}     []
   */
  function validateElement(ele){
    var id = "#"+ele;
    removeErrorMsg(id);
    if(!validateRequired(id)){
      makeErrorMsg(ele, $("label[for="+ele+"]").text() + " is required");
    }
  }

  /**
   * [validateForm validating for for required validations]
   * @return {[type]} [description]
   */
  function validateForm(){
    var eleIds = ['genre_name', 'genre_id', 'imgUrl'];

    eleIds.forEach(function(data, idx, arr){
      validateElement(data);
    });
  }

  /**
   * [makeImgForModal makes an image element]
   * @param  {[String]} img_url [src url of the image]
   * @return {[JQuery Element]} [image element]
   */
  function makeImgForModal(img_url){
    return imgContent = $('<img />', {
      src: img_url
    });
  }


  /**
   * [fetchImg fetching image for associating url]
   * @param  {[type]} img_url [url of the image]
   * @return {[void]}         []
   */
  function fetchImg(img_url){
    $.ajax({
      url: img_url,
      type: 'GET',
      statusCode: {
        404: function() {
          console.log( "page not found" );
        }
      },
      success: function(data,textStatus, XMLHttpRequest){
        var contentType = XMLHttpRequest.getResponseHeader('content-type').toLowerCase();
        var allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        var idx = allowedTypes.indexOf(contentType); // check if response is allowed
        if(idx==-1){  // silently printing user message, but associaing error logs are maintained
          console.log('illegal response');
          makeErrorMsg("imgUrl", "image cannot be loaded, resource not found");
        }

        setImgInModal(makeImgForModal(img_url));
      },
      error: function (xhr, ajaxOptions, thrownError){
        makeErrorMsg("imgUrl", "image cannot be loaded, resource not found");
      }
    });
  }
  // image url input processing
  $('#imgUrl').on('paste, keydown, blur', function() {
      var $self = $(this);
      if($self.val().trim().length){
        setTimeout(function(){
          try{
            var img_url = cleanUrl($("#imgUrl").val().trim());
            console.log("url to fetch: ",img_url);
            fetchImg(img_url);
          } catch(e){

            removeErrorMsg($("#"+ele));
            makeErrorMsg(data, $("label[for="+ele+"]").text() + " is required");
          }
        },100);
      }
   });
  /**
   * [makeDeleteBtn making delete button]
  * @return {[JQuery Element]} [delete button]
   */
  function makeDeleteBtn(){
   var delBtn = $("<button />", { type: "button", class: "delImg btn btn-default", text: "delete"});

   delBtn.click(function(e){
     $(e.target).parent().parent().remove();
   });
   return delBtn;
  }

  /**
   * [makeThumb add thumb image to table as a row]
   * @return {[JQuery Element]} [table row]
   */
  function makeThumb(){
    return $("<tr />").append($("<td />").append(imgContent)).append($('<td/>').append(makeDeleteBtn()));
  }

  /**
   * [addImgRow adding thumb image to table as a row in html]
   */
  function addImgRow(){
    $('#imgRows').append(makeThumb());
  }

  // validating addPhotos form inputs on blur event
  $("#addPhotos").find("input").blur(function(e){
    validateElement($(this).attr('id'));
  });
  // onn submit form validation and processing; adding image to table
  $('#addPhotos').on('submit', function(e){
    console.log("on submit event handler");
    e.preventDefault();

    validateForm();

    if(imgContent!=null){
      addImgRow();
      clearModalContents();
    }
  });

  $('#myModal').on('hidden.bs.modal', function (e) {
    clearModalContents();
  })
})();
