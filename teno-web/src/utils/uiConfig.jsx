import { Plus, Settings, LogOut, ArrowLeft, Terminal as TerminalIcon } from 'lucide-react'

/**
 * UI Dictionary — maps styleMode to UI text labels and icon components.
 * Consume via: const ui = getUiConfig(styleMode)
 */

export const getUiConfig = (styleMode) => {
  const isModern = styleMode === 'modern'

  return {
    logo: isModern ? 'TeNo' : 'teno',

    nav: {
      settings: isModern ? 'Settings' : '[ settings ]',
      logout:   isModern ? 'Log out'  : '[ logout ]',
      back:     isModern ? 'Back'     : '[ back ]',
    },

    icons: {
      settings: isModern ? <Settings size={14} strokeWidth={2} /> : null,
      logout:   isModern ? <LogOut   size={14} strokeWidth={2} /> : null,
      back:     isModern ? <ArrowLeft size={14} strokeWidth={2} /> : null,
      addNew:   isModern ? <Plus     size={14} strokeWidth={2.5} /> : null,
    },

    addBtn: {
      links:     isModern ? 'Add Link'     : '[+ add link]',
      cart:      isModern ? 'Add Item'     : '[+ add item]',
      reminder:  isModern ? 'Add Reminder' : '[+ add reminder]',
    },

    tabs: {
      links:     isModern ? 'Links'     : 'links',
      cart:      isModern ? 'Cart'      : 'cart',
      reminders: isModern ? 'Reminders' : 'reminders',
      timer:     isModern ? 'Timer'     : 'timer',
    },

    terminal: {
      reopenBar: isModern ? 'Terminal hidden — click to reopen' : '$_ terminal hidden. type to reopen.',
    },

    placeholders: {
      search: isModern ? 'Search...' : 'search...',
    },
  }
}
