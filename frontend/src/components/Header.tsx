interface HeaderProps {
  users: string[];
  selectedUser: string;
  onSelectUser: (user: string) => void;
}

export default function Header({ users, selectedUser, onSelectUser }: HeaderProps) {
  const initials = selectedUser.slice(0, 2).toUpperCase();
  return (
    <header>
      <div className="brand">
        <img src="/piver-logo.png" alt="piver" />
        <span className="sep" />
        <span className="tag">Event Tracking</span>
      </div>
      <label className="userpick">
        <span className="avatar">{initials}</span>
        <select
          value={selectedUser}
          onChange={(e) => onSelectUser(e.target.value)}
          aria-label="Utilisateur du résumé"
        >
          {users.map((u) => (
            <option key={u} value={u}>
              user {u}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
