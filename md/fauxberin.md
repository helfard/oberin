<!--
ニセベリンについて
　FauxberinことOberinのパチモンについての説明。
-->

## ニセベリンについて

## 短いまとめ

- Oberinの公式サイトは [oberin.be](https://www.oberin.be/) か [oberin.com](https://www.oberin.com/) です。
- ドメインの末尾が .org とか .io とか .net のやつはパチモンなので注意！

## 長いまとめ

　あんまりこういう話題に触れるのもどうかとは思うのだが、これもまた記録されるべき歴史の一部だと信じて一応書き残しておこう。

### Oberinの公式サイトは [oberin.be](https://www.oberin.be/) か [oberin.com](https://www.oberin.com/) です

　Oberinの公式サイトは [oberin.be](https://www.oberin.be/) か [oberin.com](https://www.oberin.com/) である。昔は oberin.com だけが公式サイトだったけど、現在はどちらにアクセスしても同じサイトが表示されるようになっている。ゲーム内のメッセージでも oberin.be が公式サイトであると明記されている（一部に oberin.com から直し忘れている場所もあって、一応報告はしたけど今のところ放置されている）。サイトのデザインは20年以上前からほとんど変わっていないように見えるけど、地味に何度かリニューアルしていて、今もあちこち少しずつ手直しされているらしい。

　ところで、Googleで『Oberin』を検索すると何だかOberinと良く似た感じの別のOberinが出てくる。ドメインの末尾が .com とか .be ではなくて .org とか .io とか .net とかになってるやつだ。これらのどれかにアクセスすると、ブラウザ上で動作するOberinにそっくりなゲームが始まる。基本的なところは露骨に同じだが、かといって細かいところはあちこち違う。そのベースになっているのは今よりもずっと古いバージョンのOberinのようだが、その一方で本物のOberinにも見当たらないような新機能もいくらか実装されているように見える。これは一体何なのか？

　この謎を解明するため、我々はアマゾンの奥地に向かった。嘘。本当はその辺で捕まえた何か知ってそうな人達に片っ端から聞いて回り、ついでにOberin Discordサーバの過去ログを掘りまくった。

### ニセベリンとは？

　結論から言うと、これらはいわゆるOberinのパチモンである。

　事の顛末はこうだ。

　Oberinの開発が停滞を極めていた2018年頃のことだ。当時の開発/運営陣に、Oberinをオープンソースプロジェクトとして再構築することを持ちかけてきた者が居た。ちなみにその人物がそれまで開発/運営サイドだったことはない。あのう、そちらは一体どちらさんで？

　当時の開発/運営陣は彼の提案を若干胡散臭げな目で見ていたようだが、それはそうとして当時のOberinが進化の袋小路で立ち往生していたこともまた事実だった。ちょっと前にはJinkerとStefanがいきなり何を血迷ったのかiPhone版Oberinを作ろうとしてGlennにジャーマンスープレックスで沈められたりしたとかしなかったとかの噂を聞いたけど本当かな？

　この頃のGlennは既にOberinの開発に直接関与する立場ではなかったが、Oberinをオープンソース化することには協力的だった。恐らくはそれが大きな後押しとなり、何やかんやでOberinのソースコード（2018年当時のもの）は公開された。これはGlennのソースコードをベースに開発を引き継いだStefanとArikiの追記分が含まれているものだったようで、現在もGitHubでその内容を確認することができる。でも古いMacの開発環境（CodeWarrior）が必要だから、今そこから実際にOberinを組み立てて動くまで持っていくのは大変だろうね。

　オープンソースプロジェクトになったOberinは公開当初は多少の動きがあったものの、割と短期間で停滞した。そりゃそうだ、当時のOberinはまずそれを開発するためのツールとかから全部用意し直さないと先に進めないという状況で、要するに必要なのは改修ではなく移植レベルの大工事だった。こんなの本来はゲーム会社の開発チームとかでやることであって、有志の個人がどうにかできるような規模ではない。

　この件で何か良かったことがあったとしたら、ソースコードの解析によってそれまでは明らかでなかった細かいゲームの仕様が分かったことくらいだろう。例えばゾンビに呪われて超臭くなるとその臭いに釣られてモンスターが寄ってくるとか……マジかよ、あれプレイヤーに対する精神的な嫌がらせ以外にもちゃんと効果とかあったんだ。

　結局のところこのアプローチは駄目だった。故に当代のGM、BobleyとSorn達はこのオープンソースのOberinとはまた別に、自分達で独自にOberinの開発を続けることにした。当面はエミュレータを用いた疑似マルチプラットフォームで凌ぎつつも、いつかはちゃんとエミュレータなしでそれぞれのOSでネイティブ稼働するゲームに作り直す。そうそう簡単には芽が出る作業ではなかったが、Bobley達は驚異的な粘り強さで何年も開発を続けた。鋼のメンタルに草生える。

　そんなこんなの2024年頃、Bobleyの書いていたソースコードが盗まれるという事件があった。詳しいことは分からないけど、開発中バージョンのソースコードにアクセスできる限られた数人の開発者の中に、ソースコードを流出させてクビになった人が居たらしい。これについてはあまり踏み込まなかったのでそれが誰だったのかは分からないけど、私が知ってる名前じゃなかったら良いなあ。

　詳細は全く分からないけど、2025年には何か大きな開発方針の変更もあったようだ。5年以上かけたソースコードを盗まれてもまた改めてやり直すとか、もはやタングステンみたいな強靭メンタルで草枯れる。

　Bobley達の開発は続き、2026年に入る頃には当初の構想通りのマルチプラットフォームに対応したOberinがお披露目できる目処が立っていたようだ。これの背景にはAIの普及と高性能化によってプログラミングの負担が大幅に軽減されて、開発スピードが超加速したなんて事情もあったみたい。

　そんな折の2026年3月末頃、突然Webブラウザで動作する別のOberinが公開された。その開発者はかつてOberinのオープンソース化を持ちかけてきた例の人物である。お前、オープンソース化したOberinが息してないのに実は生きとったんか。ややこしいのでここからは当面の仮称としてBobley達が開発を続けているOberinを本家、この人物が持ってきたWebブラウザで動くOberinを分家と呼ぶことにしよう。

　件の彼はわざわざ本家のDicordサーバにやってきて分家のアピールを行い、さらに何らかの『提案』をしたようだ。彼の発言はほとんど消されてしまっているので具体的にどんな内容だったのか今となっては分からないが、まだ残っている他の人の返信などから推測するに：

- 恐らく本家の開発/運営陣に事前に何の相談もなくいきなり分家（つまり事実上の競合ゲーム）の宣伝をぶちかまして反感を買った。
- 恐らく本家が開発中のマルチプラットフォーム版Oberinの存在をわざと無視して「Webブラウザ上でOberinを動かすことに成功しました！」とか書いて反感を買った。
- 恐らく「これからのOberinは俺らが引き継ぐから！」とか書いて反感を買った。
- 恐らく「新しいモダンなOberinで遊ぼうぜ！」とか書いて本家のプレイヤーを引き抜こうとして反感を買った。
- 恐らく「分家がOberinを引き継いだら本家の開発/運営陣を全員クビにしてこのDiscordサーバも閉鎖する！」とか書いて反感を買った。
- 宣伝に12個もメンションタグを付けて各方面に通知を出しまくって反感を買った。
- 何故か分家に昔オープンソース化した時点ではゲーム内に存在せず、その後に本家に追加されたモンスターがそのままの名前・グラフィックで入っていた。
- **何故か分家に2024年に盗まれた開発中バージョンのソースコードにしか存在しない仕様の魔法（正式公開版では仕様変更されたやつ）が入っていた。**
- **何故か分家に2024年に盗まれた開発中バージョンのソースコードに存在した『次期バージョンで実装予定の要素（まだ作りかけ）』が多数、しかも作りかけの状態で入っていた。**
- 恐らく「ソースコードは一般公開されていたもの（過去のオープンソースのものと誤認させようとしているが実際は盗まれて流出したもの）を取り入れた」とか苦しい言い訳をして反感を買った。
- 恐らく「もしもお前らが分家を拒否したとしても分家は分家で勝手にやっていくから！」とか書いて反感を買った。

　( ﾟдﾟ) ・・・  
　  
　(つд⊂)ｺﾞｼｺﾞｼ  
　  
　(；ﾟдﾟ) ・・・  
　  
　(つд⊂)ｺﾞｼｺﾞｼｺﾞｼ  
　  
　(；ﾟДﾟ) ・・・？  
　　 \_, .\_  
　(；ﾟ Дﾟ) ・・・！？

　何だこれヤベェ。もうどこから突っ込んだら良いのか分からんぞ！(;ﾟ∀ﾟ)=3

　私のプログラムのスキルは趣味レベルだけど、それでも個人的な経験から言うと、自分が書いたソースコードが流用されたらそりゃ気付く。それは規模の大きなプログラムであるほどより分かりやすくなるだろう。流出データで作った紛い物とかお出しされたBobleyは良く耐えられたものだ。アダマンタイトみたいな激強メンタルで草も生えん。噂によると実はふわふわの猫（名前はFenix）を飼っていたから耐えられたそうだ。猫すげえ。

　彼はGlennにBobley達のOberin開発が頓挫したと嘘を吐き、oberin.comのドメインを奪い取ろうとまでしたようだ。結局それはBobleyがJinker経由でGlennに状況を説明して奪い返したそうだけど。こんな調子では賛同者なぞ現れるはずもない。

　全方位から袋叩きにされた彼は最終的に逆ギレからの荒らしムーブで無事本家のDiscordサーバから追い出され、後に分家のDiscordサーバを立ち上げた。ちなみに分家のDiscordサーバはちょっとでも本家の話題に触れるとBANというディストピア感マシマシのやべー鯖である。

　とりあえずここからは本家Oberinを唯一にして正統なる本物のOberinと呼ぶこととして良いだろう。一部の人達は分家OberinのことをFauxberinと呼んでいると聞いたが、実際にそう呼んでいる場面をほとんど見たことがないのでどの程度一般化した呼び名なのかは分からない。Fauxとは『偽の』という意味なので、日本語に翻訳するならニセベリンとでもなるだろうか。ニュアンス的にエセベリンとかクレベリンでも良い気がするな。

### ニセベリンのその後

　ニセベリンは明らかに法的あるいは道義的に問題のある要素が満載だ。多少は独自のアイデアに基づく改良があったとしても、それで存在が許されるような代物ではないだろう。

　最終的に、Oberinの開発/運営陣は以下のような声明を出した。

> Hello everyone.
> 
> The Oberin GM Team has discussed at length the proposals recently made by MattF. Before we begin, we would like to take a moment to acknowledge that everyone involved here cares deeply about Oberin. We believe that all parties are striving to do what they feel is best for the community, even when visions differ. With that in mind, we want to clearly share our position.
> 
> While we recognize the amount of work that went into this project, we have ultimately decided that we cannot endorse or support it, for the following reasons:
> 
> There is already an active effort underway to develop a new version of Oberin, and our focus remains there. This work may appear slower in pace, but it reflects ongoing input from – and our responsibility to – the existing community.
> 
> At the time this project was introduced, there was no established working relationship or foundation of trust that would support a collaboration of this scope. We remain open to collaboration with those who wish to engage in good faith within the existing community and its processes. The public and uncoordinated manner in which the proposal was introduced made it difficult to engage in a constructive or collaborative way.
> 
> Elements of the proposal suggest a different direction for the game and its stewardship, including how development decisions are made and how the community is involved. This does not align with how we believe Oberin should continue to evolve.
> 
> The project, in its current form, makes use of code and/or assets originating from non-public development versions of Oberin. These materials were never released or authorized for external use. This is a serious concern for us and contributes significantly to our decision.
> 
> Our priority remains the continued development of Oberin in a way that reflects the collaborative foundation of this community. We remain committed to supporting the players who make this world what it is today, and to moving forward in a way that builds trust, stability, and good stewardship that stands the test of time.
> 
> Because, in our view, the project is in breach of copyright laws, among others, and potentially has both criminal and civil ramifications for its creators, we have made the decision to not allow any further linking to, promotion of or advertising of this project. However, you are welcome to discuss the project otherwise in #other-games but we will be closely monitoring to determine if further moderation will be required.
> 
> Goddess’s blessings upon you all.

「みなさん、こんにちは。

　Oberin GMチームは、MattF氏から最近提出された提案について、時間をかけて綿密に議論を重ねてきました。本題に入る前に、ここに関わる全員がOberinを深く大切に思っていることを、改めてお伝えしたいと思います。ビジョンに違いはあっても、すべての関係者がコミュニティにとって最善だと信じる道を目指して努力していると私たちは信じています。そのことを念頭に置いた上で、私たちの立場を明確にお伝えいたします。

　このプロジェクトに費やされた多大な労力は十分に認識しておりますが、以下の理由から、最終的に本プロジェクトを承認・支持することはできないという結論に至りました。

　現在、Oberinの新しいバージョンを開発するための取り組みがすでに活発に行われており、私たちの焦点は引き続きそちらにあります。この作業のペースは遅く見えるかもしれませんが、それは既存のコミュニティからの継続的な意見を取り入れ、そのコミュニティに対する私たちの責任を果たしていることを反映したものです。

　このプロジェクトが発表された時点では、この規模の協力を支えるような確立された協力関係や信頼の基盤は存在しませんでした。私たちは、既存のコミュニティとそのプロセスの中で誠意を持って関わりたいと望む方々との協力には引き続きオープンな姿勢で臨みます。しかし、提案が公然と、かつ調整のない形で提示されたため、建設的かつ協力的な形で関与することが困難でした。

　提案の内容には、開発上の意思決定の方法やコミュニティの関与の在り方を含め、ゲームとその運営に関する異なる方向性が示唆されています。これは、私たちが考えるOberinの今後の進化の方向性と一致しません。

　このプロジェクトは、現在の形態において、Oberinの非公開開発版に由来するコードやアセットを使用しています。これらの素材は、外部での使用を許可されたことも、公開されたこともありません。これは私たちが極めて重大に受け止めている懸念事項であり、今回の決定に大きく寄与しています。

　私たちの最優先事項は、このコミュニティの協働という基盤を反映した形で、Oberinの開発を継続することです。私たちは、この世界を今日の姿に築き上げてくれたプレイヤーを支援し、信頼と安定性を築き、時代の試練に耐えうる適切な運営を実現する形で前進していくことに、引き続き尽力してまいります。

　私たちの見解として、当プロジェクトは著作権法をはじめとする法令に違反しており、その制作者に対して刑事上および民事上の責任が生じる可能性があるため、当プロジェクトへのリンク、宣伝、広告を一切許可しないという決定を下しました。ただし、#other-games チャンネルでの当プロジェクトに関するその他の議論は歓迎しますが、さらなるモデレーションが必要かどうかを判断するため、当方では注意深く監視を行ってまいります。

　皆様に女神の祝福がありますように」

　…まあ、そうなるよな。というかこの文章を考えた人は聖人か何かかな。こんなの私なら「shine boke」で済ませるぞ。Oberinの各地に大量の猫が居るのはこのためだったのかも知れないな。

　2026年6月末にOberinはWindows/MacのマルチプラットフォームMMOとして復活を遂げた。それと前後するように、それまで熱心にアップデートを重ねていたニセベリンの方の動きはパタッと止まった。実に分かりやすい。どうやら彼の家にはふわふわの猫は居なかったらしい。

　これを書いている2026年7月現在ではOberinとニセベリンの両陣営は表面上はお互いに完全無視みたいな形で落ち着いているものの、水面下では今もバッチバチにやり合ってるらしく、Googleの検索結果ではOberin関連のサイトとニセベリン関連のサイトの掲載順位が激しく入れ替わっている。

　彼らの戦いはまだ終わっていないのである。
