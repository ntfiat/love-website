/**
 * Interactive 3D Bookshelf Controller
 * Handles book pull-out, 3D flip, handwritten reading view, and sound effects
 */

import { audio } from './audio.js';
import { onNamesChange } from './names.js';

export class BookshelfController {
  constructor() {
    this.books = document.querySelectorAll('.storybook-item');
    this.modal = document.querySelector('.book-modal-backdrop');
    this.modalTitle = document.querySelector('.opened-book-title');
    this.modalQuote = document.querySelector('.opened-book-quote');
    this.modalFooter = document.querySelector('.opened-book-footer');
    this.closeBtn = document.querySelector('.opened-book-close');
    this.shelfCat = document.querySelector('.shelf-mascot-cat');

    this.currentBookId = null;
    this.bookData = {};

    onNamesChange(({ boy, girl }) => {
      this.updateNames(boy, girl);
    });

    this.init();
  }

  updateNames(boy, girl) {
    this.bookData = {
      'good-people': {
        title: "Good People 📖",
        quote: `Out of all the people in this big, busy world, you're the one who makes ${boy}'s life feel genuinely special and kind.`,
        footer: `— With all my love, ${boy} ♡`
      },
      'softer-days': {
        title: "Softer Days 🌸",
        quote: `You make every day feel softer, ${girl}. Whenever life gets overwhelming, one thought of you brings me peace.`,
        footer: `— Inscribed by ${boy} ♡`
      },
      'brighter-you': {
        title: "Brighter You ☀️",
        quote: "You somehow make everything a little brighter. Your laughter carries a golden light that fills my heart with joy.",
        footer: `— ${boy} to ${girl} ♡`
      },
      'happier-us': {
        title: "Happier Us ✨",
        quote: `Every laugh with you is a memory I keep replaying like my favorite song on repeat. Here's to ${boy} & ${girl}.`,
        footer: "— Forever Us ♡"
      },
      'forever': {
        title: "Forever ♡ 💍",
        quote: `Okay… maybe I'm getting ahead of myself. Or maybe ${boy}'s heart just already knows that ${girl} is where it wants to stay forever.`,
        footer: `— ${boy}'s eternal wish ♡`
      },
      'more-love': {
        title: "More Love 💌",
        quote: `Loving you isn't something I have to think about, ${girl}. It flows as naturally as breathing.`,
        footer: `— Deep in ${boy}'s heart ♡`
      },
      'more-smiles': {
        title: "More Smiles 😊",
        quote: `My favorite smile in the world is the one that appears on my face when your message pops up, ${girl}.`,
        footer: `— From ${boy}'s screen to yours ♡`
      },
      'more-us': {
        title: "More Us 🌿",
        quote: `More quiet evenings, more shared songs, more silly inside jokes... more ${boy} & ${girl}.`,
        footer: `— ${boy}'s keepsake note ♡`
      },
      'always-you': {
        title: "Always You ♡ 🌙",
        quote: `No matter how many skies we walk under, every path in my life leads back to you, ${girl}.`,
        footer: `— Always and forever, ${boy} ♡`
      }
    };

    // If modal is actively open, refresh its content live
    if (this.currentBookId && this.bookData[this.currentBookId] && this.modal?.classList.contains('active')) {
      const data = this.bookData[this.currentBookId];
      this.modalQuote.textContent = `“${data.quote}”`;
      this.modalFooter.textContent = data.footer;
    }
  }

  init() {
    if (!this.books.length || !this.modal) return;

    this.books.forEach(book => {
      book.addEventListener('click', () => {
        const bookId = book.dataset.bookId;
        this.openBook(bookId);
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeBook());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeBook();
        }
      });
    }

    // Escape key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeBook();
      }
    });

    // Shelf mascot click
    if (this.shelfCat) {
      this.shelfCat.addEventListener('click', () => {
        audio.playCatSound();
        this.shelfCat.style.transform = 'scale(1.3) rotate(15deg)';
        setTimeout(() => {
          this.shelfCat.style.transform = '';
        }, 300);
      });
    }
  }

  openBook(bookId) {
    this.currentBookId = bookId;
    const data = this.bookData[bookId];
    if (!data) return;

    audio.playBookOpenSound();

    this.modalTitle.textContent = data.title;
    this.modalQuote.textContent = `“${data.quote}”`;
    this.modalFooter.textContent = data.footer;

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeBook() {
    this.currentBookId = null;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}
