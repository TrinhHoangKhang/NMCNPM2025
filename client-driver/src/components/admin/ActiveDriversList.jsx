import { formatTimeAgo } from '../../utils/formatters';

const ActiveDriversList = ({ drivers }) => {
    return (
        <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
            <h2 className="text-xl mb-4 font-bold border-b border-gray-700 pb-2">Drivers</h2>
            <ul>
                {drivers.map(driver => (
                    <li key={driver.id} className="mb-2 p-3 bg-gray-700 rounded flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Driver {driver.id.substr(0, 5)}...</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${driver.is_online ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></span>
                        </div>
                        <div className="text-xs text-gray-400">
                            {driver.is_online ? (
                                <span className="text-green-400 font-medium">Online</span>
                            ) : (
                                <span>Last seen {formatTimeAgo(driver.last_seen_at?.toDate ? driver.last_seen_at.toDate() : driver.last_seen_at)}</span>
                            )}
                        </div>
                    </li>
                ))}
                {drivers.length === 0 && <p className="text-gray-400 text-sm">No drivers found</p>}
            </ul>
        </div>
    );
};

export default ActiveDriversList;
