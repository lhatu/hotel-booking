import React, { useMemo, useState } from 'react'
import { assets, facilityIcons, roomsDummyData } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';

const CheckBox = ({label, selected = false, onChange = () => { }}) => {
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type="checkbox" checked={selected} onChange={(e)=>onChange(e.target.checked, label)}/>
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const RadioButton = ({label, selected = false, onChange = () => { }}) => {
    return (
        <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
            <input type="radio" name='shortOption' checked={selected} onChange={()=>onChange(label)}/>
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const AllRooms = () => {

    const [searchParam, setSearchParam] = useSearchParams();
    const { rooms, navigate, currency } = useAppContext()

    const [openFilter, setOpenFilter] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        roomType: [],
        priceRange: []
    })
    const [selectedSort, setSelectedSort] = useState('');

    const roomTypes = [
        "Single Bed",
        "Double Bed",
        "Deluxe Room",
        "Family Room",
    ];
    const priceRanges = [
        "50 to 100",
        "100 to 200",
        "200 to 300",
        "300 to 400",
    ];
    const sortOptions = [
        "Price: Low to High",
        "Price: High to Low",
        "Newest First",
    ];
    const handleFilterChange = (checked, value, type) => {
        setSelectedFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters };
            if (checked) {
                updatedFilters[type].push(value);
            } else {
                updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
            }
            return updatedFilters;
        })
    };
    const handleSortChange = (value) => {
        setSelectedSort(value);
    };
    const matchesRoomType = (room) => {
        return selectedFilters.roomType.length === 0 || selectedFilters.roomType.includes(room.roomType);
    }
    const matchesPriceRange = (room) => {
        return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some(range => {
            const [min, max] = range.split(' to ').map(Number);
            return room.pricePerNight >= min && room.pricePerNight <= max;
        });
    }
    const sortRooms =(a, b) => {
        if (selectedSort === "Price: Low to High") {
            return a.pricePerNight - b.pricePerNight;
        } else if (selectedSort === "Price: High to Low") {
            return b.pricePerNight - a.pricePerNight;
        } else if (selectedSort === "Newest First") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0; // Default case
    }
    const filteredDestination = (room) => {
        const destination = searchParam.get('destination');
        if (!destination) return true;
        return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
    }
    const filteredRooms = useMemo(() => {
        return rooms.filter(room => matchesRoomType(room) && matchesPriceRange(room) && filteredDestination(room))
            .sort(sortRooms);
    }, [rooms, selectedFilters, selectedSort, searchParam]);
    const clearFilters = () => {
        setSelectedFilters({
            roomType: [],
            priceRange: []
        });
        setSelectedSort('');
        setSearchParam({});
    }

    return (
        <div className='flex flex-col-reverse lg:flex-row items-start justify-between
        pt-28 md:pt-35 px-4 md:px-16 lg:px-24'>
            <div>
                <div className='flex flex-col items-start text-left'>
                    <h1 className='font-playfair text-4xl md:text-[40px]'>Hotel Rooms</h1>
                    <p className='text-sm md:text-base text-gray-500/90 mt-2'>Take advantage of our limited-time offers and special
                    packages to enhance your stay and create unforgettable memories.</p>
                </div>

                {filteredRooms.map((room) => (
                    <div className='flex flex-col md:flex-row items-start py-10 gap-6 border-b
                    border-gray-300 last:border-0' key={room._id}>
                        <img src={room.images[0]} alt="hotel-img" title='View Room Details'
                            className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer'
                            onClick={() => {navigate(`/rooms/${room._id}`); scrollTo(0, 0)}}
                        />
                        <div className='md:w-1/2 flex flex-col gap-2'>
                            <p className='text-gray-500'>{room.hotel.city}</p>
                            <p className='text-gray-800 text-3xl font-playfair cursor-pointer'
                            onClick={() => {navigate(`/rooms/${room._id}`); scrollTo(0, 0)}}>{room.hotel.name}</p>
                            <div className='flex items-center'>
                                <StarRating />
                                <p className='ml-2'>200+ reviews</p>
                            </div>
                            <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                                <img src={ assets.locationIcon } alt="location-icon" />
                                <span>{ room.hotel.address }</span>
                            </div>
                            {/* Room Amemnities */}
                            <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                                { room.amenities.map((item, index)=>(
                                    <div key={index} className='flex items-center gap-2 px-3 py-2
                                    rouded-lg bg-[#F5F5F5]/70'>
                                        <img src={ facilityIcons[item] } alt={item} className='w-5 h-5'/>
                                        <p className='text-xs'>{ item }</p>
                                    </div>
                                )) }
                            </div>
                            {/* Room Price Per Night */}
                            <p className='text-xl font-medium text-gray-700'>${ room.pricePerNight }/night</p>
                        </div>
                    </div>
                ))}
            </div>
            {/* Filter */}
            <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16'>

                <div className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300
                ${openFilter && "border-b"}`}>
                    <p className='text-base font-medium text-gray-800'>FILTERS</p>
                    <div className='text-xs cursor-pointer'>
                        <span onClick={()=> setOpenFilter(!openFilter)} className='lg:hidden'>{openFilter ? 'HIDE' : 'SHOW'}</span>
                        <span className='hidden lg:block'>CLEAR</span>
                    </div>
                </div>

                <div className={`${openFilter ? 'h-auto' : "h-0 lg:h-auto"} overflow-hidden transition-all duration-700`}>
                    <div className='px-5 pt-5'>
                        <p className='font-medium text-gray-800 pb-2'>Popular Filters</p>
                        {roomTypes.map((room, index) => (
                            <CheckBox key={index} label={room} selected={selectedFilters.roomType.includes(room)}
                            onChange={(checked) => handleFilterChange(checked, room, 'roomType')} />
                        ))}
                    </div>
                    <div className='px-5 pt-5'>
                        <p className='font-medium text-gray-800 pb-2'>Price Range</p>
                        {priceRanges.map((range, index) => (
                            <CheckBox key={index} label={`${currency} ${range}`} selected={selectedFilters.priceRange.includes(range)}
                            onChange={(checked) => handleFilterChange(checked, range, 'priceRange')} />
                        ))}
                    </div>
                    <div className='px-5 pt-5 pb-7'>
                        <p className='font-medium text-gray-800 pb-2'>Sort By</p>
                        {sortOptions.map((option, index) => (
                            <RadioButton key={index} label={option} selected={selectedSort === option}
                            onChange={() => handleSortChange(option)} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AllRooms