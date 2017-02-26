var imgContent = null;
var base_url = "https://lh3.googleusercontent.com/";

function setImgInModal(cnt){
  $('#rcontent').html(cnt);
}

function clearModalContents(){
  $('#imgUrl').val("");
  imgContent = null;
  setImgInModal("");
}

function cleanUrl(img_url) {
  console.log("received uncleaned url: ", img_url);
  if( (img_url.length == 0) || (img_url.indexOf("https://www.")==0) || (img_url.indexOf("www")==0) ) {
    throw new Error("invalid url");
  } else if(img_url.indexOf(base_url)==0){
    if(img_url.length==base_url.length){
      throw new Error("incomplete url, resource not given");
    }
  } else if(img_url.indexOf("/")==0){
    img_url = img_url.substr(1, img_url.length);
    cleanUrl(img_url);
    img_url = base_url+img_url;
  } else if(img_url.indexOf(base_url)==-1){
    img_url = base_url+img_url;
  }
  console.log("return clean url: ",img_url);
  return img_url;
}

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
      var idx = allowedTypes.indexOf(contentType); // return value to check if response is allowed
      if(idx==-1){
        console.log('illegal response');
      }
      imgContent = $('<img />', {
        src: img_url
      });
      setImgInModal(imgContent);
    },
    error: function (xhr, ajaxOptions, thrownError){
      console.log("error occured");
    }
  });
}

function doFetchThumb(){
  var $self = $('#imgUrl');
  if($self.val().trim().length){
    setTimeout(function(){
      try{
        var img_url = cleanUrl($("#imgUrl").val().trim());
        console.log("url to fetch: ",img_url);
        fetchImg(img_url);
      } catch(e){
        console.log(e);
      }
    },100);
  }
}
$('#imgUrl').on('paste, keypress, blur', function() {
    doFetchThumb();
 });
$('#addPhotos').on('submit', function(e){
  console.log("on submit event handler");
  e.preventDefault();
  if(imgContent!=null){

    var thumb;
    var delBtn = $("<button />", { type: "button", class: "delImg btn btn-default", text: "delete"});

    delBtn.click(function(e){
      $(e.target).parent().parent().remove();
    });
    thumb = $("<tr />").append($("<td />").append(imgContent)).append($('<td/>').append(delBtn));
    $('#imgRows').append(thumb);

    clearModalContents();
  } else{
    doFetchThumb();
  }
});

$('#myModal').on('hidden.bs.modal', function (e) {
  clearModalContents();
})
