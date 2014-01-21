$(document).ready(function()
{
    $(".friendsList-expand").click(function()
    {
        $(this).parent().children('.friendsList-list').slideToggle();
    });
    $(".friendsList-list .category").click("toggle", function()
    {        
        var categoryImageObject = $(this).children(".category-expand");
        $(this).parent().children(".category-list").slideToggle({"complete": function()
            {
                var categoryImage = $(this).parent().children('.category-list').css("display") === "none" ? "plus" : "minus";
                categoryImageObject.attr("src", "/images/social/" + categoryImage + ".png");
            }});
        //determine which image to show (+) or (-)
    });
    
});
$(document).scroll(function(e) {
    // b is the fixed div
    $('.friendsList').css({'top': $(document).scrollTop() + 10});
});