# 國際象棋, HTML+CSS+jQuery

## 12/21/2024 更新:
1. 新增房間密碼，確保好友之間約定的對戰不會被外人打擾，若不想設也可留空
2. 把每個 php 檔內的連線設定整合成 db.php ，若要改密碼的話不用每個 php 檔都重改

## 使用方法
1. 把整個資料夾(website_final_project) 丟在 xampp/htdocs (不能只把資料夾內容丟進去，不然有些file path會錯)

2. 匯入資料庫 final_project.sql 到 localhost，並確認資料庫名字必須是 final_project 。 還有注意你 phpmyadmin 的 root 密碼應該要設定空的! (即"")，不然你必須到 website_final_project/php/db.php 把裡面的 $password 改成你對應的密碼。

3. 開啟兩個分頁 "http://localhost/website_final_project/login.html" 並註冊不同帳號

4. 其中一個帳號按 create game ，另一個再按 join game ，並根據前者的 game_id 加入對應的房間即可連線。

