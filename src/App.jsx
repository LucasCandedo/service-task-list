import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import {
  Plus, Wrench, Archive, Trash2, Settings, X, CheckCircle2,
  Clock, DollarSign, RotateCcw, ChevronRight, Sun, Moon,
  Menu, Palette, AlertTriangle, ArchiveRestore, Hammer,
  ClipboardList, Star
} from 'lucide-react'

// Color presets
const COLOR_PRESETS = [
  { name: 'Red', hsl: '0 84% 60%', hex: '#ef4444' },
  { name: 'Orange', hsl: '24 95% 53%', hex: '#f97316' },
  { name: 'Amber', hsl: '43 96% 56%', hex: '#f59e0b' },
  { name: 'Green', hsl: '142 71% 45%', hex: '#22c55e' },
  { name: 'Teal', hsl: '173 80% 40%', hex: '#14b8a6' },
  { name: 'Blue', hsl: '217 91% 60%', hex: '#3b82f6' },
  { name: 'Violet', hsl: '263 70% 50%', hex: '#7c3aed' },
  { name: 'Pink', hsl: '330 81% 60%', hex: '#ec4899' },
]

const VIEWS = { tasks: 'tasks', archive: 'archive', trash: 'trash' }

const DEFAULT_SETTINGS = { theme: 'dark', primaryColor: COLOR_PRESETS[0] }

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch { return defaultValue }
  })

  const set = useCallback((v) => {
    setValue(v)
    try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
  }, [key])

  return [value, set]
}

function applyTheme(theme, primaryColor) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  root.style.setProperty('--primary', primaryColor.hsl)
  root.style.setProperty('--ring', primaryColor.hsl)
  root.style.setProperty('--destructive', primaryColor.hsl)
}

// Logo SVG component
function AppLogo({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="64" height="64" rx="16" fill="hsl(var(--primary))" />
      <rect x="8" y="8" width="48" height="48" rx="12" fill="hsl(var(--primary) / 0.3)" />
      {/* Clipboard */}
      <rect x="16" y="18" width="32" height="34" rx="4" fill="white" fillOpacity="0.15" />
      <rect x="16" y="18" width="32" height="34" rx="4" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
      {/* Clipboard top */}
      <rect x="24" y="14" width="16" height="8" rx="3" fill="white" fillOpacity="0.3" />
      <rect x="24" y="14" width="16" height="8" rx="3" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
      {/* Lines */}
      <line x1="22" y1="30" x2="42" y2="30" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="37" x2="38" y2="37" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      {/* Wrench */}
      <path d="M35 44 L45 34 M42 31 C44 29 46 30 46 30 L43 33 L41 33 L41 31 L44 28 C44 28 42 27 40 29 C38 31 38 34 40 36 C42 38 45 38 47 36" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      {/* Checkmark on one line */}
      <circle cx="20" cy="30" r="2" fill="hsl(var(--primary))" />
      <path d="M19 30 L20.2 31.2 L22 29" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Task form dialog
function TaskDialog({ open, onClose, onSave, editTask = null }) {
  const [name, setName] = useState(editTask?.name || '')
  const [price, setPrice] = useState(editTask?.price || '')
  const [isPaid, setIsPaid] = useState(editTask?.isPaid || false)

  useEffect(() => {
    if (open) {
      setName(editTask?.name || '')
      setPrice(editTask?.price || '')
      setIsPaid(editTask?.isPaid || false)
    }
  }, [open, editTask])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), price: parseFloat(price) || 0, isPaid })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AppLogo size={28} />
            {editTask ? 'Edit Repair' : 'New Repair Task'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-foreground/80">Service Name</Label>
            <Input
              id="task-name"
              placeholder="e.g. Engine oil change, Brake pads..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-price" className="text-foreground/80">Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="task-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-9 price-tag"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2">
              {isPaid
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                : <Clock className="h-4 w-4 text-amber-500" />
              }
              <Label htmlFor="paid-switch" className="cursor-pointer text-foreground/80">
                {isPaid ? 'Marked as Paid' : 'Mark as Pending'}
              </Label>
            </div>
            <Switch id="paid-switch" checked={isPaid} onCheckedChange={setIsPaid} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            {editTask ? 'Update' : 'Add Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Confirm dialog
function ConfirmDialog({ open, title, description, onConfirm, onCancel, confirmLabel = 'Confirm', variant = 'destructive' }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">{description}</p>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Settings dialog
function SettingsDialog({ open, onClose, settings, onSettingsChange }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Theme */}
          <div className="space-y-3">
            <Label className="text-foreground/70 text-xs uppercase tracking-widest font-semibold">Appearance</Label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-2">
                {settings.theme === 'dark' ? <Moon className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} /> : <Sun className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />}
                <span className="text-sm font-medium">{settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <Switch
                checked={settings.theme === 'dark'}
                onCheckedChange={(v) => onSettingsChange({ ...settings, theme: v ? 'dark' : 'light' })}
              />
            </div>
          </div>
          {/* Color */}
          <div className="space-y-3">
            <Label className="text-foreground/70 text-xs uppercase tracking-widest font-semibold flex items-center gap-1">
              <Palette className="h-3 w-3" /> Primary Color
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => onSettingsChange({ ...settings, primaryColor: color })}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all hover:scale-105"
                  style={{
                    borderColor: settings.primaryColor.name === color.name ? color.hex : 'transparent',
                    backgroundColor: settings.primaryColor.name === color.name ? `${color.hex}15` : 'transparent'
                  }}
                  title={color.name}
                >
                  <div
                    className="w-7 h-7 rounded-full shadow-md transition-transform"
                    style={{
                      backgroundColor: color.hex,
                      transform: settings.primaryColor.name === color.name ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: settings.primaryColor.name === color.name ? `0 0 12px ${color.hex}80` : 'none'
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Task card
function TaskCard({ task, onTogglePaid, onEdit, onArchive, onDelete, onRestore, onPermanentDelete, view }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="task-card group relative bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
      {/* Accent line */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full accent-line opacity-60" />

      <div className="pl-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{task.name}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="price-tag text-base font-medium" style={{ color: 'hsl(var(--primary))' }}>
                ${task.price.toFixed(2)}
              </span>
              {task.isPaid
                ? <Badge variant="success" className="text-xs h-5"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>
                : <Badge variant="warning" className="text-xs h-5"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {view === VIEWS.tasks && (
              <>
                <button
                  onClick={() => onTogglePaid(task.id)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title={task.isPaid ? 'Mark Pending' : 'Mark Paid'}
                >
                  {task.isPaid
                    ? <Clock className="h-4 w-4 text-muted-foreground" />
                    : <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  }
                </button>
                <button
                  onClick={() => onEdit(task)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit"
                >
                  <Star className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => onArchive(task.id)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title="Archive"
                >
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </>
            )}
            {view === VIEWS.archive && (
              <>
                <button
                  onClick={() => onRestore(task.id)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title="Restore to tasks"
                >
                  <ArchiveRestore className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </>
            )}
            {view === VIEWS.trash && (
              <>
                <button
                  onClick={() => onRestore(task.id)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title="Restore"
                >
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => onPermanentDelete(task.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete permanently"
                >
                  <X className="h-4 w-4 text-destructive" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sidebar navigation
function Sidebar({ isOpen, onClose, currentView, onViewChange, counts, onSettingsOpen }) {
  const navItems = [
    { view: VIEWS.tasks, label: 'Active Tasks', icon: ClipboardList, count: counts.tasks },
    { view: VIEWS.archive, label: 'Archive', icon: Archive, count: counts.archive },
    { view: VIEWS.trash, label: 'Trash', icon: Trash2, count: counts.trash },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <AppLogo size={40} />
            <div>
              <h1 className="font-bold text-lg text-foreground leading-tight">Service Task</h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide">LIST</p>
            </div>
            <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-secondary transition-colors lg:hidden">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">Navigation</p>
          {navItems.map(({ view, label, icon: Icon, count }) => (
            <button
              key={view}
              onClick={() => { onViewChange(view); onClose() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentView === view
                  ? 'text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              style={currentView === view ? { backgroundColor: 'hsl(var(--primary))', color: 'white' } : {}}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  currentView === view ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
                }`}>
                  {count}
                </span>
              )}
              {currentView === view && <ChevronRight className="h-3 w-3 opacity-70" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => { onSettingsOpen(); onClose() }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <p className="text-center text-xs text-muted-foreground/50 pt-1">Service Task List v1.0</p>
        </div>
      </aside>
    </>
  )
}

// Empty state
function EmptyState({ view }) {
  const states = {
    [VIEWS.tasks]: { icon: Hammer, title: 'No tasks yet', desc: 'Add your first repair task to get started.' },
    [VIEWS.archive]: { icon: Archive, title: 'Archive is empty', desc: 'Completed tasks you archive will appear here.' },
    [VIEWS.trash]: { icon: Trash2, title: 'Trash is empty', desc: 'Deleted tasks will appear here before permanent removal.' },
  }
  const { icon: Icon, title, desc } = states[view]
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-secondary">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('stl-tasks', [])
  const [archive, setArchive] = useLocalStorage('stl-archive', [])
  const [trash, setTrash] = useLocalStorage('stl-trash', [])
  const [settings, setSettings] = useLocalStorage('stl-settings', DEFAULT_SETTINGS)

  const [currentView, setCurrentView] = useState(VIEWS.tasks)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  const { toast } = useToast()

  // Apply theme on change
  useEffect(() => {
    applyTheme(settings.theme, settings.primaryColor || COLOR_PRESETS[0])
  }, [settings])

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
  }

  // Add / Edit task
  const handleSaveTask = ({ name, price, isPaid }) => {
    if (editTask) {
      setTasks(tasks.map(t => t.id === editTask.id ? { ...t, name, price, isPaid } : t))
      toast({ title: 'Task updated', description: name })
    } else {
      const newTask = { id: crypto.randomUUID(), name, price, isPaid, createdAt: new Date().toISOString() }
      setTasks([newTask, ...tasks])
      toast({ title: 'Task added!', description: name, variant: 'success' })
    }
    setEditTask(null)
  }

  const handleEdit = (task) => {
    setEditTask(task)
    setTaskDialogOpen(true)
  }

  const handleTogglePaid = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isPaid: !t.isPaid } : t))
  }

  // Archive task
  const handleArchive = (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    setArchive([{ ...task, archivedAt: new Date().toISOString() }, ...archive])
    setTasks(tasks.filter(t => t.id !== id))
    toast({ title: 'Moved to archive', description: task.name })
  }

  // Delete to trash (from tasks or archive)
  const handleDelete = (id) => {
    const fromTasks = tasks.find(t => t.id === id)
    const fromArchive = archive.find(t => t.id === id)
    const task = fromTasks || fromArchive
    if (!task) return
    setTrash([{ ...task, deletedAt: new Date().toISOString() }, ...trash])
    if (fromTasks) setTasks(tasks.filter(t => t.id !== id))
    else setArchive(archive.filter(t => t.id !== id))
    toast({ title: 'Moved to trash', description: task.name })
  }

  // Restore from trash (back to tasks)
  const handleRestoreFromTrash = (id) => {
    const task = trash.find(t => t.id === id)
    if (!task) return
    const { deletedAt, ...restored } = task
    setTasks([{ ...restored, restoredAt: new Date().toISOString() }, ...tasks])
    setTrash(trash.filter(t => t.id !== id))
    toast({ title: 'Task restored', description: task.name, variant: 'success' })
  }

  // Restore from archive (back to tasks)
  const handleRestoreFromArchive = (id) => {
    const task = archive.find(t => t.id === id)
    if (!task) return
    const { archivedAt, ...restored } = task
    setTasks([{ ...restored }, ...tasks])
    setArchive(archive.filter(t => t.id !== id))
    toast({ title: 'Task restored to active', description: task.name, variant: 'success' })
  }

  // Permanent delete
  const handlePermanentDelete = (id) => {
    setConfirmDialog({
      title: 'Delete permanently?',
      description: 'This action cannot be undone. The task will be permanently removed.',
      onConfirm: () => {
        setTrash(trash.filter(t => t.id !== id))
        toast({ title: 'Permanently deleted', variant: 'destructive' })
        setConfirmDialog(null)
      }
    })
  }

  // Empty trash
  const handleEmptyTrash = () => {
    setConfirmDialog({
      title: 'Empty trash?',
      description: `This will permanently delete all ${trash.length} item(s) in the trash. This cannot be undone.`,
      onConfirm: () => {
        setTrash([])
        toast({ title: 'Trash emptied', variant: 'destructive' })
        setConfirmDialog(null)
      }
    })
  }

  const currentList = currentView === VIEWS.tasks ? tasks : currentView === VIEWS.archive ? archive : trash

  // Stats
  const totalPending = tasks.filter(t => !t.isPaid).reduce((s, t) => s + t.price, 0)
  const totalPaid = tasks.filter(t => t.isPaid).reduce((s, t) => s + t.price, 0)
  const pendingCount = tasks.filter(t => !t.isPaid).length
  const paidCount = tasks.filter(t => t.isPaid).length

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
        counts={{ tasks: tasks.length, archive: archive.length, trash: trash.length }}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {/* Header */}
        <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-30 -mx-4 px-4 py-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <AppLogo size={28} />
              <div>
                <h1 className="text-sm font-bold text-foreground leading-none">Service Task</h1>
                <p className="text-xs text-muted-foreground font-semibold tracking-widest uppercase">List</p>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Dashboard stats (only on tasks view) */}
        {currentView === VIEWS.tasks && tasks.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5 animate-slide-in">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500" /> Pending
              </p>
              <p className="price-tag text-xl font-bold text-foreground">${totalPending.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{pendingCount} task{pendingCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Paid
              </p>
              <p className="price-tag text-xl font-bold text-foreground">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{paidCount} task{paidCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-foreground capitalize">
              {currentView === VIEWS.tasks ? 'Active Tasks' : currentView === VIEWS.archive ? 'Archive' : 'Trash'}
            </h2>
            <p className="text-xs text-muted-foreground">{currentList.length} item{currentList.length !== 1 ? 's' : ''}</p>
          </div>
          {currentView === VIEWS.trash && trash.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleEmptyTrash} className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Empty Trash
            </Button>
          )}
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {currentList.length === 0 ? (
            <EmptyState view={currentView} />
          ) : (
            currentList.map((task) => (
              <div key={task.id} className="animate-slide-in">
                <TaskCard
                  task={task}
                  view={currentView}
                  onTogglePaid={handleTogglePaid}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onRestore={currentView === VIEWS.trash ? handleRestoreFromTrash : handleRestoreFromArchive}
                  onPermanentDelete={handlePermanentDelete}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAB - Add task */}
      {currentView === VIEWS.tasks && (
        <button
          onClick={() => { setEditTask(null); setTaskDialogOpen(true) }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30"
          style={{ backgroundColor: 'hsl(var(--primary))', boxShadow: `0 8px 32px hsl(var(--primary) / 0.4)` }}
        >
          <Plus className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Dialogs */}
      <TaskDialog
        open={taskDialogOpen}
        onClose={() => { setTaskDialogOpen(false); setEditTask(null) }}
        onSave={handleSaveTask}
        editTask={editTask}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {confirmDialog && (
        <ConfirmDialog
          open={true}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          confirmLabel="Delete"
        />
      )}

      <Toaster />
    </div>
  )
}
