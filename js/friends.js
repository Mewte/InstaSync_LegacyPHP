$(document).ready(function()
{
    $(".friendsList-list .category").click(function()
    {
        alert('test');
    });
    
});
$(document).scroll(function(e) {
    // b is the fixed div
    $('.friendsList').css({'top': $(document).scrollTop() + 10});
});