/**
 * 麻雀精算プログラム
 * 複数人の勝ち額から最小限の支払いで精算する方法を計算
 */

class MahjongSettlement {
    constructor() {
        this.players = new Map(); // プレイヤー名 -> 勝ち額
    }

    /**
     * プレイヤーとその勝ち額を追加
     * @param {string} playerName - プレイヤー名
     * @param {number} amount - 勝ち額（正の値は勝ち、負の値は負け）
     */
    addPlayer(playerName, amount) {
        this.players.set(playerName, amount);
    }

    /**
     * 精算方法を計算
     * @returns {Array} 支払い指示の配列
     */
    calculateSettlement() {
        // 勝ち額を配列に変換
        const balances = Array.from(this.players.entries()).map(([name, amount]) => ({
            name,
            amount
        }));

        // 勝ち額でソート（負けている人から勝っている人へ）
        balances.sort((a, b) => a.amount - b.amount);

        const payments = [];
        let left = 0;
        let right = balances.length - 1;

        while (left < right) {
            const debtor = balances[left];   // 負けている人
            const creditor = balances[right]; // 勝っている人

            if (debtor.amount >= 0) break; // 全員が勝っている場合
            if (creditor.amount <= 0) break; // 全員が負けている場合

            const payment = Math.min(-debtor.amount, creditor.amount);

            if (payment > 0) {
                payments.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: payment
                });
            }

            debtor.amount += payment;
            creditor.amount -= payment;

            if (debtor.amount === 0) left++;
            if (creditor.amount === 0) right--;
        }

        return payments;
    }

        /**
     * 数値をカンマ区切りでフォーマット
     * @param {number} num - フォーマットする数値
     * @returns {string} カンマ区切りの文字列
     */
    formatNumber(num) {
        return num.toLocaleString('ja-JP');
    }

    /**
     * 精算結果を表示
     */
    displaySettlement() {
        console.log("=== 麻雀精算結果 ===");
        console.log("\n【現在の状況】");
        this.players.forEach((amount, name) => {
            const formattedAmount = this.formatNumber(amount);
            const status = amount > 0 ? `+${formattedAmount}` : formattedAmount;
            console.log(`${name}: ${status}`);
        });

        const payments = this.calculateSettlement();

        if (payments.length === 0) {
            console.log("\n【精算完了】");
            console.log("支払いは必要ありません。");
            return;
        }

        console.log("\n【精算方法】");
        payments.forEach((payment, index) => {
            const formattedAmount = this.formatNumber(payment.amount);
            console.log(`${index + 1}. ${payment.from} → ${payment.to}: ${formattedAmount}`);
        });

        console.log("\n【精算完了】");
        console.log(`合計 ${payments.length} 回の支払いで精算完了`);
    }

    /**
     * 精算が正しいか検証
     * @returns {boolean} 精算が正しいかどうか
     */
    validateSettlement() {
        const total = Array.from(this.players.values()).reduce((sum, amount) => sum + amount, 0);
        return Math.abs(total) < 0.01; // 浮動小数点誤差を考慮
    }
}

// 使用例
function example() {
    const settlement = new MahjongSettlement();

    // プレイヤーと勝ち額を追加
    settlement.addPlayer("田中", 50000);
    settlement.addPlayer("佐藤", -30000);
    settlement.addPlayer("鈴木", 20000);
    settlement.addPlayer("高橋", -40000);

    // 精算結果を表示
    settlement.displaySettlement();

    // 検証
    if (settlement.validateSettlement()) {
        console.log("\n✅ 精算が正しく計算されています");
    } else {
        console.log("\n❌ 精算に誤りがあります");
    }
}

// インタラクティブな入力機能
function interactiveInput() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const settlement = new MahjongSettlement();
    let playerCount = 0;

    console.log("麻雀精算プログラム");
    console.log("==================");

    rl.question("プレイヤー数を入力してください: ", (count) => {
        playerCount = parseInt(count);
        if (isNaN(playerCount) || playerCount < 2) {
            console.log("有効なプレイヤー数を入力してください（2人以上）");
            rl.close();
            return;
        }
        inputPlayers(0);
    });

    function inputPlayers(index) {
        if (index >= playerCount) {
            rl.close();
            settlement.displaySettlement();
            if (settlement.validateSettlement()) {
                console.log("\n✅ 精算が正しく計算されています");
            } else {
                console.log("\n❌ 精算に誤りがあります");
            }
            return;
        }

        rl.question(`プレイヤー${index + 1}の名前を入力してください: `, (name) => {
            rl.question(`${name}の勝ち額を入力してください（負けの場合は負の値、カンマ可）: `, (amount) => {
                // カンマを除去してから数値に変換
                const cleanAmount = amount.replace(/,/g, '');
                const numAmount = parseFloat(cleanAmount);
                if (isNaN(numAmount)) {
                    console.log("有効な数値を入力してください");
                    inputPlayers(index);
                    return;
                }
                settlement.addPlayer(name, numAmount);
                inputPlayers(index + 1);
            });
        });
    }
}

// メイン実行
if (require.main === module) {
    // コマンドライン引数でモードを選択
    const args = process.argv.slice(2);

    if (args.includes('--example') || args.includes('-e')) {
        example();
    } else if (args.includes('--interactive') || args.includes('-i')) {
        interactiveInput();
    } else {
        console.log("使用方法:");
        console.log("  node calc.js --example     # サンプル実行");
        console.log("  node calc.js --interactive # インタラクティブ入力");
        console.log("\nサンプルを実行します...");
        example();
    }
}

module.exports = MahjongSettlement;
