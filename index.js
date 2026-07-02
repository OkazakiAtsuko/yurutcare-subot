// ボットのパスワードが書かれたファイルをインポートする
require('dotenv').config();

// --- サーバー関連のコード ---
// サーバーの設計書をインポートする
const http = require('http');
// 設計書をもとに、サーバーを立てる
const server = http.createServer((req, res) => {
    // レスポンスのヘッダー（ステータスコードとデータの形式を書いたもの）を設定する
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    // レスポンスの本文（本文とは、実際に表示したい内容のこと）
    res.end('nomadLaBOT is running.\n');
});
// グローバルオブジェクトの'process'から、'PORT'という環境変数を探す
const PORT = process.env.PORT || 3000; // ローカルとネット上でポート番号を替える
server.listen(PORT, '0.0.0.0', () => { // すべてのインターフェイスからの接続を受け入れる
    // サーバーが起動したことをコンソールに表示させる
    console.log(`サーバーがポート ${PORT} で起動しました。`);
});
// --- ---

// --- ボットの組み立て ---
// ボットの開発に必要な設計書をインポートする
const { Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require("discord.js");
// 設計書をもとにボットを組み立てる
const client = new Client({
    intents: [GatewayIntentBits.Guilds] // インテントとは「どの情報を受信するか」という、ボットのアンテナのこと
});
// --- ---

// --- ボットが起動したときの処理 ---
// ボットがサーバーにログインできたときに、一度だけ以下の処理を実行する
client.once(Events.ClientReady, async () => {
    // 1. ボットが起動したことをコンソールに表示させる
    console.log(`${client.user.tag} が正常に起動しました！`); // '.tag'とは、ボットの名前のこと
    // ボットが最初に見つけたサーバーを直接取得する
    const guild = client.guilds.cache.first();
    // ボットがサーバーに参加していなかった場合
    if (!guild) {
        console.error("ボットがどのサーバーにも参加していません。サーバーに招待してから起動してください。");
        return;
    }
    // エラーになっても処理をやめないようトライする
    try {
        // 2. 取得したサーバーに直接スラッシュコマンドを登録する非同期処理
        await guild.commands.set([
            // {
            //     name: "setup",
            //     description: "個人チャンネル作成ボタンを設置する"
            // },
            {
                name: "pannel-ticket",
                description: "相談用パブリックチャンネル作成ボタンを設置する"
            }
        ]);
        // 3. スラッシュコマンドが登録できたことをコンソールに表示させる
        console.log(`サーバー'${guild.name}'(ID: ${guild.id})に'/pannel-ticket'を登録しました。`);
    // サーバー権限がなかったときなどのエラーをキャッチする
    } catch (error) {
        console.error(`サーバー「${guild.name}」(ID: ${guild.id})へのスラッシュコマンド登録中にエラーが発生しました。:`, error);
    }
});
// --- ---

// --- スラッシュコマンドへの反応 ---
// インタラクションがあったときに以下の処理を実行する
client.on("interactionCreate", async (interaction) => {
    // スラッシュコマンド以外には反応しないようにする
    if (!interaction.isChatInputCommand()) return;
    
    // --- スラッシュコマンドを実行した人の権限を確認する ---
    // 権限がそもそも与えられているか、また、権限は管理者かどうかを確認する
    const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
    // 'サポーター'というロールを探す
    const supporterRole = interaction.guild.roles.cache.find(role => role.name === "サポーター");
    // 'サポーター'かどうかを確認する
    const isSupporter = supporterRole && (
        Array.isArray(interaction.member.roles)
            ? interaction.member.roles.includes(supporterRole.id)
            : interaction.member.roles.cache.has(supporterRole.id)
    );
    // どちらのスラッシュコマンドの場合も、管理者か'サポーター'権限がなければ拒否する
    if (interaction.commandName === "pannel-ticket") {
        if (!isAdmin && !isSupporter) {
            return interaction.reply({
                content: "すみません、このスラッシュコマンドは管理者またはサポーターだけが実行できます。",
                flags: [MessageFlags.Ephemeral] // 本人にだけ見えるメッセージ
            });
        }
    }
    // --- ---

    // // --- '/setup'が実行された場合 ---
    // if (interaction.commandName === "setup") {
    //     // 青色のボタンを設計する
    //     const row = new ActionRowBuilder().addComponents(
    //         new ButtonBuilder()
    //             .setCustomId("create_private_channel")
    //             .setLabel("個人チャンネルを作成する")
    //             .setStyle(ButtonStyle.Primary) // 青色のボタン
    //     );
    //     // 設計書をもとに、ボタン付きのメッセージを送る
    //     await interaction.reply({
    //         content: "下のボタンを押すと、あなたとスタッフだけの個人チャンネルが作成されます。",
    //         components: [row]
    //     });
    // }
    // // --- ---

    // --- '/pannel-ticket'が実行された場合 ---
    if (interaction.commandName === "pannel-ticket") {
        // 緑色のボタンを設計する
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("create_public_ticket")
                .setLabel("個人相談を開始する")
                .setStyle(ButtonStyle.Success) // 緑色のボタン
        );
        // 設計書をもとに、ボタン付きのメッセージを送る
        await interaction.reply({
            content: "下のボタンを押すと、サポーターに相談をするチャンネルが作成されます。",
            components: [row]
        });
    }
    // --- ---
});
// --- ---

// --- ボタンへの反応 ---
// インタラクションがあったときに以下の処理を実行する
client.on("interactionCreate", async (interaction) => {
    // ボタン以外に反応しないようにする
    if (!interaction.isButton()) return;

    // // --- '個人チャンネル作成'ボタンが押された場合 ---
    // if (interaction.customId === "create_private_channel") {
    //     await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    //     // サーバーを動的に取得する
    //     const guild = interaction.guild;
    //     // ユーザーを動的に取得する
    //     const user = interaction.user;
    //     // 'スタッフ'ロールを探す
    //     const staffRole = guild.roles.cache.find(role => role.name === "スタッフ");
    //     // 'スタッフ'がサーバーにいない場合は個人チャンネルを作成できない
    //     if (!staffRole) {
    //         return interaction.editReply({ content: "サーバー内に「スタッフ」ロールが見つかりません。事前にロールを作成してください。" });
    //     }
    //     // すでに個人チャンネルが作成されていないか探す###チャンネル名を変えるときに変更が必要###
    //     const existingChannel = guild.channels.cache.find(c =>
    //         c.type === ChannelType.GuildText && (
    //             c.name === `${user.displayName}の部屋` ||
    //             (c.permissionOverwrites && c.permissionOverwrites.cache.has(user.id) && c.name.endsWith("の部屋"))
    //         )
    //     );
    //     // すでに個人チャンネルを作成している場合はそれを案内する
    //     if (existingChannel) {
    //         return interaction.editReply({ content: `すでにあなたの個人チャンネル ${existingChannel} は作成されています！` });
    //     }
    //     // エラーになっても処理をやめないようトライする
    //     try {
    //         // 1. 個人チャンネルを作成する
    //         const privateChannel = await guild.channels.create({
    //             // チャンネル名###チャンネル名を変えるときに変更が必要
    //             name: `${user.displayName}の部屋`,
    //             type: ChannelType.GuildText,
    //             permissionOverwrites: [
    //                 // 全員には非表示
    //                 { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    //                 // ボタンを押したユーザーには表示
    //                 { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    //                 // スタッフには表示
    //                 { id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    //                 // ボットにも表示
    //                 { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    //             ],
    //         });
    //         // 2. ボットにメッセージを送信させる
    //         await interaction.editReply({ content: `${privateChannel} を作成しました！` });
    //         await privateChannel.send({ content: `${user} さん、こんにちは！\nこのチャンネルはあなたと管理者、スタッフだけが参加しています。` });
    //     // エラーをキャッチする
    //     } catch (error) {
    //         console.error(error);
    //         // ボットがメッセージを送る
    //         await interaction.editReply({ content: "チャンネルの作成中にエラーが発生しました。" });
    //     }
    // }
    // --- ---

    // --- '相談チャンネル作成'ボタンが押された場合 ---
    if (interaction.customId === "create_public_ticket") {
        // ボタンを押した人にしか見えないメッセージを送ることで処理落ちを防ぐ
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        // サーバーを動的に取得する
        const guild = interaction.guild;
        // ボタンを押した人を動的に取得する
        const member = interaction.member; // サーバー内のユーザー情報（表示名・メンション取得用）
        // 'サポーター'ロールを取得する
        const supporterRole = guild.roles.cache.find(role => role.name === "サポーター");
        // サーバーに'サポーター'がいない場合は相談チャンネルを作成できない
        if (!supporterRole) {
            return interaction.editReply({ content: "サーバー内に「サポーター」ロールが見つかりません。事前にロールを作成してください。" });
        }
        // エラーになっても処理をやめないようトライする
        try {
            // 1. 本日の日付（YYMMDD）を取得する
            const now = new Date();
            const yy = String(now.getFullYear()).slice(-2);
            // Dateが0から始まるため、+1する
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            // 年月日を連結させる
            const dateStr = `${yy}${mm}${dd}`;
           
             // 2. 表示名を取得する
            const safeDisplayName = member.displayName.toLowerCase().replace(/[^a-z0-9あ-んア-ン一-龠ー]/g, '-');
            const channelPrefix = `${dateStr}${safeDisplayName}`;
            
            // 3. 現在サーバー内にある同じパターンのチャンネルから、最大の数字を探す
            let maxNumber = 0;
            guild.channels.cache.forEach(c => {
                if (c.type === ChannelType.GuildText && c.name.startsWith(channelPrefix)) {
                    const numPart = c.name.replace(channelPrefix, '');
                    const num = parseInt(numPart, 10);
                    if (!isNaN(num) && num > maxNumber) {
                        maxNumber = num;
                    }
                }
            });
            // 同じ相談チャンネルがあれば、数を+1する
            const nextNumber = maxNumber + 1;
            
            // 4. チャンネル名の定義　例：'260629鳥越涼介01'
            const finalChannelName = `${channelPrefix}${nextNumber}`;
           
            // 5. 'pannel-ticket'が実行されたカテゴリを取得する
            const parentCategoryId = interaction.channel.parentId;
            
            // 6. カテゴリ内に相談チャンネルを作成する
            const publicChannel = await guild.channels.create({
                // チャンネル名は'260629鳥越涼介01'のようになる
                name: finalChannelName,
                type: ChannelType.GuildText,
                parent: parentCategoryId,
            });
            // 7. 赤い'相談を終わる'ボタンを設計する
            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("close_public_ticket")
                    .setLabel("相談を終わる")
                    .setStyle(ButtonStyle.Danger) // 赤色のボタン
            );
            // 8. ボットが完了報告をする
            await interaction.editReply({ content: `${publicChannel} を作成しました！` });
            
            // 9. 設計書をもとに、ボタン付きのメッセージを送る
            await publicChannel.send({
                content: `${supporterRole}\n${member} さんの相談チャンネルが作成されました。相談を詳細に書いて送ってください。サポーターが対応させていただきます。\n対応が完了したら、ボタンを押してチャンネルを閉じてください。`,
                components: [closeRow]
            });
        // エラーをキャッチする
        } catch (error) {
            // コンソールにエラーを表示
            console.error("相談チャンネル作成中にエラーが発生しました:", error);
            // ボットがエラーメッセージを送る
            await interaction.editReply({ content: "相談チャンネルの作成中にエラーが発生しました。" });
        }
    }
    // --- ---

    // ---'相談を終わる'ボタンが押された場合 ---
    else if (interaction.customId === "close_public_ticket") {
        // サーバーを動的に取得する
        const guild = interaction.guild;
        // 相談者を動的に取得する
        const member = interaction.member;
        // 管理者か'サポーター'かを確認する
        const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
        const supporterRole = guild.roles.cache.find(role => role.name === "サポーター");
        const isSupporter = supporterRole && (
            Array.isArray(interaction.member.roles)
                ? interaction.member.roles.includes(supporterRole.id)
                : interaction.member.roles.cache.has(supporterRole.id)
        );
        // 相談者本人かを確認する
        const safeDisplayName = member.displayName.toLowerCase().replace(/[^a-z0-9あ-んア-ン一-龠ー]/g, '-');
        // 相談者とチャンネル名の名前が合っているかを確認する
        const isOwner = interaction.channel.name.includes(safeDisplayName);
        // 管理者でもサポーターでも、相談者本人でもない場合は拒否する
        if (!isAdmin && !isSupporter && !isOwner) {
            return interaction.reply({
                content: "このチャンネルを閉じることができるのは、管理者か'サポーター'、または相談者本人だけです。",
                flags: [MessageFlags.Ephemeral]
            });
        }
        // エラーになっても処理をやめないようトライする
        try {
            // 処理中メッセージを出してから、5秒後にチャンネルを削除する
            await interaction.reply({ content: "このチャンネルは5秒後に閉じます..." });
            // 以下の非同期処理をタイマーでセットする
            setTimeout(async () => {
                // 5000ms(5s)後に、ボタンが押されたチャンネルを削除する非同期処理
                await interaction.channel.delete();
            }, 5000);
        // エラーをキャッチする
        } catch (error) {
            console.error("チャンネル削除中にエラーが発生しました:", error);
            // 本人にだけ見えるメッセージを送る
            await interaction.reply({ content: "チャンネルの削除中にエラーが発生しました。", flags: [MessageFlags.Ephemeral] });
        }
    }
    // --- ---
});
// --- ---

// パスワードを使い、ログインする
client.login(process.env.DISCORD_TOKEN);