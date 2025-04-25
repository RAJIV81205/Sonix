

const Hero = () => {
    return (
        <div className="w-full h-full min-h-screen grid grid-cols-10 grid-rows-9 gap-1">
            <div className="col-start-1 col-span-3 row-start-1 row-span-5 bg-blue-300">Div 1</div>
            <div className="col-start-1 col-span-3 row-start-6 row-span-4 bg-blue-300">Div 2</div>
            <div className="col-start-4 col-span-5 row-start-1 row-span-9 bg-blue-300">Div 3</div>
            <div className="col-start-8 col-span-3 row-start-1 row-span-3 bg-blue-300">Div 4</div>
            <div className="col-start-8 col-span-3 row-start-4 row-span-6 bg-blue-300">Div 5</div>
        </div>

    )
}

export default Hero