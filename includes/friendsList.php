		<div class="friendsList">
			<div class="whisper-container">
<!--            <div class="whisper-window" id="friends-list-whisper-userID-32">
                    <div class="whisper-window-title-bar">
                        <div class="close"></div>
                        <div class="window-title">Messaging Mewte</div>                        
                    </div>
                    <div class="whisper-window-content">
                        <div class="whisper-box" >
                            <div class="whisper you">
                                <span class="username">Mew:</span>
                                <span class="message"></span>
                            </div>                   
                        </div>
                        <input id="send-whisper" class="send-whisper" placeholder="Send Message.." type="text" maxlength="240"/>
                    </div>
                </div>-->
            </div>
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
                        (<span id="friends-list-received-count" class="category-count">0</span>) Received
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                        <!--
                            Notifications stuff here
                        -->
                    </div>
                    <ul id="friends-list-received-list" class="category-list"></ul>
                </li>
                <li>
                    <div class="category">
                        (<span id="friends-list-sent-count" class="category-count">0</span>) Sent
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                    </div>
                    <ul id="friends-list-sent-list" class="category-list"></ul>
                </li>
                <li>
                    <div class="category">
                        (<span id="friends-list-chatwindow-count" class="category-count">0</span>) Chat Windows
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />                       
                    </div>
                    <ul id="friends-list-chatwindows-list" class="category-list"></ul>
                </li>                
                <li>
                    <div class="category">
                        (<span id="friends-list-online-count" class="category-count">0</span>) Online
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                    </div>
                    <ul id="friends-list-online-list" class="category-list"></ul>
                </li>
                <li>
                    <div class="category">
                        (<span id="friends-list-offline-count" class="category-count">0</span>) Offline
                        <img class="category-expand" src="/images/social/plus.png" height="16" width="16" />
                    </div>
                    <ul id="friends-list-offline-list" class="category-list"></ul>
                </li>
                <li>
                    <div>
                        <img id="add-friend" style="float: right; cursor: pointer;" src="/images/social/add-friend.png" height="24" width="24" />
                    </div>
                </li>
            </ul>
            <div class="context-menu"></div>
        </div>