import { PACKAGING_OPTIONS } from '../../../constants/cargoPackagingOptions';

export function PackagingPicker({ value = [], onChange }) {
    const toggle = (k) => {
        const next = value.includes(k)
            ? value.filter((x) => x !== k)
            : [...value, k];
        onChange(next);
    };

    return (
        <div className='accf__tags'>
            {PACKAGING_OPTIONS.map(({ key, label }) => (
                <label
                    key={key}
                    className='accf__checkbox accf__checkbox--pill'
                >
                    <input
                        type='checkbox'
                        checked={value.includes(key)}
                        onChange={() => toggle(key)}
                    />
                    <span>{label}</span>
                </label>
            ))}
        </div>
    );
}
