import LoadingSpinner from "@/components/LoadingSpinner";

const Loading = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <LoadingSpinner size={40} />
        </div>
    );
};

export default Loading;