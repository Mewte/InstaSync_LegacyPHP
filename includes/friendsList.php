    <script type="text/javascript" src="/js/perfect-scrollbar-0.4.8.with-mousewheel.min.js"></script>
    <div class="friendsList">
            <div class="friendsList-expand">
                <img class="friends-list-icon" src="/images/social/friends_icon.png" height="26" width="26"/>
                <div class="friend-count"><span class="count">0</span> Online</div>
                <img class="friends-list-expand-icon" src="/images/social/expand.png" height="22" width="22"/>
                <!--
                Notifications stuff here
                -->
            </div>
            <ul class="friendsList-list">
                <li>
                    <div class="category">
                        (<span id="friends-list-received-count">0</span>) Received
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                        <!--
                            Notifications stuff here
                        -->
                    </div>
                    <ul id="friends-list-received-list" class="category-list"></ul>
                </li>
                <li>
                    <div class="category">
                        (<span id="friends-list-sent-count">0</span>) Sent
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                    </div>
                    <ul id="friends-list-sent-list" class="category-list"></ul>
                </li>
                <li>
                    <div class="category">
                        (<span id="friends-list-chatwindow">0</span>) Chat Windows
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                        <!--
                            Notifications stuff here
                        -->                        
                    </div>
                    <ul id="friends-list-chatwindow" class="category-list"></ul>
                </li>                
                <li>
                    <div class="category">
                        (<span id="friends-list-online-count">0</span>) Online
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                    </div>
                    <ul id="friends-list-online-list" class="category-list"></ul>
                </li>
                <li>
                    <div class="category">
                        (<span id="friends-list-offline-count">0</span>) Offline
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                    </div>
                    <ul id="friends-list-offline-list" class="category-list"></ul>
                </li>
                <li>
                    <div class="add-friend">
                        <img src="images/social/add-friend.png" />
                    </div>
                </li>
            </ul>
            <div class="context-menu"></div>
            <div class="whisper-container">
                <div class="whisper-window" id="friends-list-whisper-userID-32">
                    <div class="whisper-window-title-bar">
                        <div class="close"></div>
                        <div class="window-title">Messaging Mewte</div>                        
                    </div>
                    <div class="whisper-window-content" style="">
                        <div class="whisper-box" >
                            <div class="whisper">
                                <span class="username">Mew:</span>
                                <span class="message">
                                What is InstaSynch?
InstaSynch (Inspired by SynchTube) is a place that allows users to watch synchronized videos with each other and chat in real time, fully synchronized!
                                </span>
                            </div>
                            <div class="whisper">
                                <span class="username">Mew:</span>
                                <span class="message">
                                    When you register, you also create a room in your name. To access this room, log in and click My Room from the settings drop down menu (accessed by clicking on your name in the top right corner.)
                                </span>
                            </div>
                            <div class="whisper">
                                <span class="username">Mew:</span>
                                <span class="message">
                                    Simply visit any room you'd like and you can begin chatting as an unregistered user. If you'd like to have all the features (adding videos, voting, and profile) you must register. 
                                </span>
                            </div>                            
                        </div>
                        <input id="send-whisper" class="send-whisper" placeholder="Send Message.." type="text" maxlength="240"/>
                    </div>
                </div>
            </div>
        </div>
        <script type="text/javascript" src="/js/friends.js">
        </script>