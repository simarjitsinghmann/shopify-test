class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById('cart-notification');
    this.header = document.querySelector('sticky-header');
    this.onBodyClick = this.handleBodyClick.bind(this);

    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    );
  }

  open() {
    this.notification.classList.add('animate', 'active');

    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.notification.classList.remove('active');
    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
    
      if(parsedState.items){
        let cartItemsHtml = '';
        const dynamicContent = new DOMParser().parseFromString(parsedState.sections['cart-notification-product'], 'text/html');
        parsedState.items.forEach(function(item){
          let cartItemKey = item.key;
          if(!dynamicContent.querySelector(`[id="cart-notification-product-${cartItemKey}"]`)) return false;
          cartItemsHtml += `<div class="cart-notification-item">`;
          cartItemsHtml +=dynamicContent.querySelector(`[id="cart-notification-product-${cartItemKey}"]`).innerHTML;
          cartItemsHtml +=`</div>`
          
        })
        document.getElementById('cart-notification-product').innerHTML = cartItemsHtml;

        this.getSectionsToRender('button').forEach((section) => {
          document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.id],
            section.selector
          );
        });
        this.getSectionsToRender('bubble').forEach((section) => {
          document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.id],
            section.selector
          );
        });
      }
      else{
        this.cartItemKey = parsedState.key;
        this.getSectionsToRender().forEach((section) => {
          document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.id],
            section.selector
          );
        });
      }

    if (this.header) this.header.reveal();
    this.open();
  }

  getSectionsToRender(type,key) {
    if(type == 'button'){
      return [
        {
          id: 'cart-notification-button',
        },
      ];
    }
    else if(type == 'bubble'){
      return [
        {
          id: 'cart-icon-bubble',
        },
      ];

    }
    else{
      return [
        {
          id: 'cart-notification-product',
          selector: `[id="cart-notification-product-${this.cartItemKey}"]`,
        },
        {
          id: 'cart-notification-button',
        },
        {
          id: 'cart-icon-bubble',
        },
      ];
    }
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    const dynamicContent = new DOMParser().parseFromString(html, 'text/html');
    if(!dynamicContent.querySelector(selector)) return false;
    return dynamicContent.querySelector(selector).innerHTML;
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      const disclosure = target.closest('details-disclosure, header-menu');
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);
