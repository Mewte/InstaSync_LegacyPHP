
$(document).ready(function()
{
    //Bind actions to dom elements (testing a new object oriented DOM element idea)
    $(".friendsList-list .category").data("this", function()
    {
        this.toggleList();
        //$(this).parent().children("ul").show();
    });
    
});
$(document).scroll(function(e) {
    // b is the fixed div
    $('.friendsList').css({'top': $(document).scrollTop() + 10});
});