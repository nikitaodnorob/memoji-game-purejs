function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function Card($card) {
    this.$card = $card;
    this.disabled = false;
    this.wrong = false;

    this.rotate = () => {
        this.$card.classList.toggle('card_opened');
    };

    this.clearState = () => {
        this.$card.classList.remove('card_opened');
        this.disabled = false;
        this.unmark();
    };

    this.getEmoji = () => {
        return this.$card.querySelector('.card__side_back').innerText;
    }

    this.setEmoji = (emoji) => {
        this.$card.querySelector('.card__side_back').innerText = emoji;
    }

    this.markAsWrong = () => {
        this.$card.querySelector('.card__side_back').classList.add('card_opened_wrong');
        this.wrong = true;
    }

    this.markAsRight = () => {
        this.$card.querySelector('.card__side_back').classList.add('card_opened_right');
        this.disabled = true;
    }

    this.unmark = () => {
        this.$card.querySelector('.card__side_back').classList.remove('card_opened_wrong');
        this.$card.querySelector('.card__side_back').classList.remove('card_opened_right');
        this.wrong = false;
    }
}

function Game($cards) {
    this.cards = $cards.map($card => new Card($card));
    this.firstCandidate = null;
    this.secondCandidate = null;

    this.compareTwoCards = () => {
        if (this.firstCandidate.getEmoji() === this.secondCandidate.getEmoji()) {
            this.firstCandidate.markAsRight();
            this.secondCandidate.markAsRight();
            this.firstCandidate = this.secondCandidate = null;

            // если все карточки заблокированы - победа!
            if (this.cards.every(card => card.disabled)) {
                this.showMessage('Win');
            }
        } else {
            this.firstCandidate.markAsWrong();
            this.secondCandidate.markAsWrong();
        }
    }

    this.resetTwoCards = () => {
        if (this.firstCandidate) {
            this.firstCandidate.rotate();
            this.firstCandidate.unmark();
        }
        if (this.secondCandidate) {
            this.secondCandidate.rotate();
            this.secondCandidate.unmark();
        }
    }

    this.startNewGame = () => {
        const emoji = ['🐷', '🐸', '🐓', '🐱', '🦄', '🐵'];

        const cardsEmoji = shuffleArray(emoji.concat(emoji));
        for (const i of Object.keys(cardsEmoji)) {
            this.cards[i].clearState();

            // таймаут, чтобы карточки менялись уже после полного переворота
            setTimeout(() => this.cards[i].setEmoji(cardsEmoji[i]), 500);
        }

        this.timerWasStarted = false;
    }

    this.redrawTimer = () => {
        const m = Math.floor(this.remainedSeconds / 60);
        const s = Math.floor(this.remainedSeconds % 60);
        const [mm, ss] = [m, s].map(d => d.toString().padStart(2, '0'));

        const $timer = document.querySelector('.timer');
        $timer.innerText = `${mm}:${ss}`;
    }

    this.startTimer = () => {
        const $timer = document.querySelector('.timer');
        $timer.style.display = 'block';
        $timer.innerText = '';

        this.remainedSeconds = 60;
        this.interval = setInterval(() => {
            if (!(--this.remainedSeconds)) {
                this.showMessage('Lose');
            }
            else this.redrawTimer();
        }, 1000);
    }

    this.showMessage = (text) => {
        const $timer = document.querySelector('.timer');
        $timer.style.display = 'none';

        clearInterval(this.interval);

        const $modalWrapper = document.querySelector('.modal-wrapper');
        $modalWrapper.style.display = 'block';

        const $modalHeader = document.querySelector('.modal-header');
        $modalHeader.innerText = text;

        const $playAgainBtn = document.querySelector('.play-again-btn');
        $playAgainBtn.innerText = text === 'Win' ? 'Play again' : 'Try again';
    }

    this.hideMessage = () => {
        const $modalWrapper = document.querySelector('.modal-wrapper');
        $modalWrapper.style.display = 'none';
    }

    this.init = () => {
        this.startNewGame();

        const $playAgainBtn = document.querySelector('.play-again-btn');
        $playAgainBtn.addEventListener('click', () => {
            this.firstCandidate = this.secondCandidate = null;
            this.startNewGame();
            this.hideMessage();
        });

        const $cards = document.querySelector('.cards');
        $cards.addEventListener('click', (event) => {
            const $target = event.target;
            if ($target === $cards) return;

            if (!this.timerWasStarted) {
                this.startTimer();
                this.timerWasStarted = true;
            }

            const $card = $target.classList.contains('card__side') ? $target.parentNode : $target;

            const card = this.cards[$card.dataset.cardId];
            if (card.disabled || card.wrong) return;

            if (this.firstCandidate && !this.secondCandidate) {
                if (this.firstCandidate !== card) {
                    this.secondCandidate = card;
                    this.compareTwoCards();
                }
            } else {
                this.resetTwoCards();
                this.firstCandidate = card;
                this.secondCandidate = null;
            }

            card.rotate();
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const $cards = Array.from(document.querySelectorAll('.card'));
    const game = new Game($cards);

    game.init();
})
