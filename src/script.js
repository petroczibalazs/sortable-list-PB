/**
 *
 * @param {*} num
 * @param {*} text
 * @returns
 */
const getAppListItem = function( num = 1, text='Lorem ipsum dolor ..' ){

    const html =
    `<li class="app__item" data-index="${num}">${num}. ${text} <svg class="app__icon" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </li>`;

       const template = document.createElement('template');
       template.innerHTML = html.trim();

      return template.content.firstElementChild;
};

/**
 *
 * @param {*} num
 * @param {*} disabled
 * @returns
 */
const getAppListInput = function( num = 1, disabled = 'false' ){

  const active = disabled === 'true'? 'active' : 'disabled';

  const html =
  `<li class="app__item app__item--input">
            <input type="text" class="app__input app__input--${active}" placeholder="${num}. Add Skill" disabled="${disabled}">
            <svg class="app__icon app__icon--drop" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
  </li>`;

  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstElementChild


};

const userSkills = [
  'Javascript',
  'ReactJs',
  'NextJs',
  'Rust'
];

let dragMouseDownPoint;
let dragMiddleLineY;
let dragIndex;
let dragItemsProperties = [];
let clone;
let marker;
let isMoving = false;



const isSkillUnique = function( skill ){

  return userSkills.indexOf( skill ) === -1;
}

const addSkill = function( e ){

const inputBox = e.target;
const parentLi = inputBox.parentNode;

const nextSkillIndex = userSkills.length + 1;
const newListItem = getAppListItem( nextSkillIndex, inputBox.value );

parentLi.replaceWith(newListItem);
userSkills.push( inputBox.value );

updateInputs( appList);

}

const addSkillByClick = function( e ){

  if(! e.target.closest('.skills__item')) return;

  const nextItemIndex = [...appList.children]
  .findIndex( child => child.classList.contains('app__item--input'));

  if( nextItemIndex === -1 ) return;


  const nextInput = [...appList.children]
  .at(nextItemIndex);

const newSkillIndex = userSkills.length + 1;

const newSkillText = e.target
.textContent
.trim()
.replace(/\s*[+]\s*/, '');

if( !isSkillUnique(newSkillText)) return;


const newListItem = getAppListItem( newSkillIndex, newSkillText );

nextInput.replaceWith( newListItem );
userSkills.push( newSkillText );
updateInputs( appList);

};

const updateInputs = function( appList ){

  const skillInputs = appList.querySelectorAll('.app__input');

  skillInputs.forEach( (input, index ) => {
    if( index == 0 ) {

      input.removeAttribute('disabled');
      input.classList.remove('app__input--disabled');
      input.classList.add('app__input--active');
      input.value= '';
      input.focus();

    }
    else {
      input.setAttribute('disabled', true);
      input.classList.remove('app__input--active');
      input.classList.add('app__input--disabled');

    }
  })
}

const fillAppList = function( userSkills, appList){

  const maxLength = 5;
  const remainder = Math.abs( maxLength - userSkills.length);

    while( appList.firstChild) { appList.removeChild( appList.firstChild )};

    for( const [index, skill] of userSkills.entries() ){

      const newItem = getAppListItem( index + 1, skill);
      appList.appendChild( newItem );
    }

    for( let x = maxLength - remainder; x < maxLength; x++ ){
      const newInput = getAppListInput( x + 1, true);
      appList.appendChild( newInput );
    }
};

const updateSkills = function( appList ){

  const skillItems = [...appList.children]
  .filter( item  =>  !item.classList.contains('app__item--input'));

  skillItems.forEach( (item, index ) => {

      item.childNodes[0].nodeValue = `${index + 1}. ${userSkills[index]}`;
  });

};

const deleteSkill = function( e ){

  if( ! e.target.closest('.app__icon')) return;

  let skillToDelete = e.target;

  while( skillToDelete.nodeName != 'LI') { skillToDelete = skillToDelete.parentNode; }



  if( skillToDelete.classList.contains('app__item--input')) return;


  const skill = skillToDelete.textContent
  .trim()
  .replace(/\d+\.\s*/, '');

  const skillIndex = userSkills
  .indexOf( skill );
  const lastSkillIndex = userSkills.length - 1;

  userSkills.splice(skillIndex, 1 );

  const newInput = getAppListInput( userSkills.length + 1, 'true');
  const itemToRemove = appList.children[skillIndex];
  const lastItem = appList.children[lastSkillIndex];

  lastItem.insertAdjacentElement('afterend', newInput);
  appList.removeChild( itemToRemove);

  updateSkills( appList );
  updateInputs( appList);

}


// the UL with choices and input fields
const appList = document.querySelector('.app__list');
appList.addEventListener('change', addSkill);
appList.addEventListener('click', deleteSkill);

// the UL with suggested skills on the right
const skillsList = document.querySelector('.skills__list');
skillsList.addEventListener('click', addSkillByClick);


fillAppList(userSkills, appList);
updateInputs( appList );
