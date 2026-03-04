const getchatId = (userId1, userId2) => {
    if (!userId1 || !userId2) throw new Error("Two users not found");

    const id1 = userId1.toString();
    const id2 = userId2.toString();

    if (id1 === id2) {
        console.error("getchatId called with same user ID:", id1);
        return id1; // fallback
    }

    const ids = [id1, id2].sort();
    return ids.join("_");
};

export default getchatId