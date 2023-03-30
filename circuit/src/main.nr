fn main(x : Field, some_list : pub [Field; 2]) {
    for i in 0..2 {
        constrain x != some_list[i];
    }
}