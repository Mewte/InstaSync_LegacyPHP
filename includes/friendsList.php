        <div class="friendsList">
        </div>
        <script type="text/javascript">
            $(document).ready(function()
            {
                
            });
            $(document).scroll(function(e) {
                // b is the fixed div
                $('.friendsList').css({'left': $(".footer").offset().left + 790});
            });
            $(window).resize(function()
            {
                $('.friendsList').css({'left': $(".footer").offset().left + 790});
            });
        </script>