        <div class="friendsList">
            <img class="friends-list-icon" src="/images/social/friends_icon.png" height="26" width="26"/>
            <div class="friend-count">4 Online</div>
            <img class="friends-list-expand-icon" src="/images/social/expand.png" height="22" width="22"/>
        </div>
        <script type="text/javascript">
            $(document).ready(function()
            {
                
            });
            $(document).scroll(function(e) {
                // b is the fixed div
                $('.friendsList').css({'top': $(document).scrollTop() + 10});
            });
            $(window).resize(function()
            {
                //$('.friendsList').css({'left': $(".footer").offset().left + 790});
            });
        </script>