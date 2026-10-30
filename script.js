const menu = [
 {category:"Hot Beverages",name:"Classic Cappuccino",price:160},
 {category:"Hot Beverages",name:"Hazelnut Velvet Cappuccino",price:199},
 {category:"Hot Beverages",name:"Classic Café Latte",price:180},
 {category:"Hot Beverages",name:"Bold Americano",price:199},
 {category:"Hot Beverages",name:"Classic Hot Chocolate",price:160},
 {category:"Hot Beverages",name:"Velvet Flat White",price:160},
 {category:"Hot Beverages",name:"Ginger Zest Tea",price:60},
 {category:"Hot Beverages",name:"Cardamom Chai",price:60},
 {category:"Hot Beverages",name:"Classic Masala Chai",price:60},
 {category:"Hot Beverages",name:"Lemon Zest Tea",price:90},
 {category:"Hot Beverages",name:"Honey Lemon Tea",price:90},
 {category:"Cold Beverages",name:"Vietnam Signature",price:250},
 {category:"Cold Beverages",name:"Hazelnut Bliss Coffee",price:220},
 {category:"Cold Beverages",name:"Iced Latte",price:199},
 {category:"Cold Beverages",name:"Iced Bold Americano",price:220},
 {category:"Cold Beverages",name:"Strawberry Cream Latte",price:240},
 {category:"Cold Beverages",name:"Strawberry Bliss Shake",price:240},
 {category:"Cold Beverages",name:"Strawberry Zest Lemonade",price:200},
 {category:"Cold Beverages",name:"Oreo Choco Crush",price:150},
 {category:"Cold Beverages",name:"Espresso Tonic",price:150},
 {category:"Cold Beverages",name:"Minty Fresh Mojito",price:150},
 {category:"Cold Beverages",name:"Ube Shake",price:150},
 {category:"Cold Beverages",name:"Rose Litchi",price:150},
 {category:"Cold Beverages",name:"Sunrise/Sunset",price:150},
 {category:"Cold Beverages",name:"Passion Fruit",price:150},
 {category:"Italian · Pizza",name:"Classic Margherita",price:200},
 {category:"Italian · Pizza",name:"Loaded Farmhouse Pizza",price:250},
 {category:"Italian · Pizza",name:"Cheesy Corn Pizza",price:200},
 {category:"Italian · Pizza",name:"Unica Cheese Pizza",price:260},
 {category:"Italian · Pizza",name:"Smoky Chicken Tikka Pizza",price:260},
 {category:"Italian · Pizza",name:"Spicy Sausage Cheese Pizza",price:290},
 {category:"Italian · Pasta",name:"Creamy Alfredo Pasta",price:230},
 {category:"Italian · Pasta",name:"Classic Arrabbiata Pasta",price:220},
 {category:"Sandwiches",name:"Unica Veg Club",price:150},
 {category:"Sandwiches",name:"Mexican Veg Club",price:160},
 {category:"Sandwiches",name:"Mexican Chicken & Veg Grill",price:180},
 {category:"Sandwiches",name:"Spicy Chicken Tikka Grill",price:180},
 {category:"Sandwiches",name:"Chicken Tikka Melt",price:180},
 {category:"Sandwiches · Croissants",name:"Classic Butter Croissant",price:130},
 {category:"Sandwiches · Croissants",name:"Chocolate Indulgence Croissant",price:150},
 {category:"Sandwiches · Croissants",name:"French Almond Croissant",price:150},
 {category:"Brownies",name:"Classic Choco Lava",price:99},
 {category:"Brownies",name:"Hazelnut Fudge Brownie",price:120},
 {category:"Brownies",name:"Classic Walnut Fudge Brownie",price:150},
 {category:"Brownies",name:"Chocolate Chip Fudge Brownie",price:150},
 {category:"Brownies",name:"Signature Cheesecake",price:200}
];
const categoryAliases = {"Italian":"Italian","Sandwiches":"Sandwiches","Hot Beverages":"Hot Beverages","Cold Beverages":"Cold Beverages","Brownies":"Brownies"};
let activeCategory = "All";
let cart = {};
let toastTimer;
const money = n => "₹" + n.toLocaleString("en-IN");
const tabs = document.getElementById("categoryTabs");
const itemsEl = document.getElementById("menuItems");
const searchEl = document.getElementById("menuSearch");
const noResults = document.getElementById("noResults");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartLines = document.getElementById("cartLines");
const toast = document.getElementById("toast");
const categories = ["All","Hot Beverages","Cold Beverages","Italian","Sandwiches","Brownies"];
function buildTabs(){
  tabs.innerHTML = categories.map(c=>`<button class="category-tab ${c===activeCategory?"active":""}" role="tab" aria-selected="${c===activeCategory}" data-category="${c}">${c}</button>`).join("");
}
function matchesCategory(item){
  if(activeCategory==="All") return true;
  if(activeCategory==="Italian") return item.category.startsWith("Italian");
  if(activeCategory==="Sandwiches") return item.category.startsWith("Sandwiches");
  return item.category===activeCategory;
}
function renderMenu(){
  const query=searchEl.value.trim().toLowerCase();
  const filtered=menu.filter(item=>matchesCategory(item)&&item.name.toLowerCase().includes(query));
  const groups={};
  filtered.forEach(item=>{(groups[item.category] ||= []).push(item)});
  itemsEl.innerHTML=Object.entries(groups).map(([group,products])=>`
    <section class="menu-group"><h3 class="menu-group-title">${group}</h3>
    ${products.map(item=>`<div class="menu-row"><div><span class="item-name">${item.name}</span></div><span class="item-price">${money(item.price)}</span><button class="add-item" aria-label="Add ${item.name} to bag" data-add="${item.name}">+</button></div>`).join("")}
    </section>`).join("");
  document.getElementById("menuCount").textContent=activeCategory==="All"?"OUR MENU":activeCategory.toUpperCase();
  noResults.hidden=filtered.length!==0;
  buildTabs();
}
function showToast(message){
  toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2200);
}
function addItem(name){
  const item=menu.find(x=>x.name===name);if(!item)return;
  cart[name]=(cart[name]||0)+1;renderCart();showToast(`${name} added to your bag`);
}
function changeQty(name,delta){
  if(!cart[name])return;cart[name]+=delta;if(cart[name]<=0)delete cart[name];renderCart();
}
function renderCart(){
  const entries=Object.entries(cart);
  const count=entries.reduce((s,[,q])=>s+q,0);
  const total=entries.reduce((s,[name,q])=>s+menu.find(x=>x.name===name).price*q,0);
  document.getElementById("cartCount").textContent=count;
  document.getElementById("subtotal").textContent=money(total);
  if(!entries.length){
    cartLines.innerHTML=`<div class="empty-cart"><span>✳</span><h3>A little room for something lovely.</h3><p>Your bag is waiting for its first favourite.</p><button class="text-link" id="browseMenu">Explore the menu ↗</button></div>`;
    document.getElementById("browseMenu").addEventListener("click",closeCart);
  }else{
    cartLines.innerHTML=entries.map(([name,q])=>{const item=menu.find(x=>x.name===name);return `<div class="cart-line"><div><div class="cart-line-name">${name}</div><div class="cart-line-controls"><button class="qty-btn" data-change="-1" data-name="${name}" aria-label="Decrease quantity">−</button><span class="qty-value">${q}</span><button class="qty-btn" data-change="1" data-name="${name}" aria-label="Increase quantity">+</button><button class="remove-line" data-remove="${name}">Remove</button></div></div><span class="cart-line-price">${money(item.price*q)}</span></div>`}).join("");
  }
  document.getElementById("checkoutMessage").textContent="";
}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");document.body.style.overflow=""}
tabs.addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;renderMenu()});
itemsEl.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addItem(b.dataset.add)});
searchEl.addEventListener("input",renderMenu);
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
cartLines.addEventListener("click",e=>{
  const change=e.target.closest("[data-change]");const remove=e.target.closest("[data-remove]");
  if(change)changeQty(change.dataset.name,Number(change.dataset.change));
  if(remove){delete cart[remove.dataset.remove];renderCart()}
});
document.getElementById("checkout").addEventListener("click",()=>{
  if(!Object.keys(cart).length){document.getElementById("checkoutMessage").textContent="Add something to your bag before continuing.";return}
  const params=new URLSearchParams(window.location.search);
  const table=params.get("table");
  const order=Object.entries(cart).map(([name,qty])=>`${qty} × ${name}`).join("\n");
  document.getElementById("checkoutMessage").textContent=
    `Demo only — no order has been sent. Connect this button to your Flask checkout API before launch.${table?` Table: ${table}.`:""} Items: ${order}`;
});
document.getElementById("menuToggle").addEventListener("click",()=>document.querySelector(".desktop-nav").classList.toggle("open"));
document.querySelectorAll("[data-category-link]").forEach(a=>a.addEventListener("click",()=>{
  activeCategory=a.dataset.categoryLink;renderMenu();
}));
document.querySelectorAll(".desktop-nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".desktop-nav").classList.remove("open")));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCart()});
const tableParam=new URLSearchParams(window.location.search).get("table");
if(tableParam){const pill=document.getElementById("tablePill");pill.hidden=false;pill.textContent=`TABLE ${tableParam}`}
buildTabs();renderMenu();renderCart();
