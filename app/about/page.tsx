'use client'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

export default function AboutPage() {
    const { scrollYProgress } = useScroll()
    const transformer = useTransform(scrollYProgress, [0, 1], [1000, 100])
    return (
        <div className="w-full">
            <motion.p className="text-center" style={{
                fontSize: transformer
            }}>
                Amhra
            </motion.p>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum optio iusto, amet debitis modi distinctio quaerat quos itaque id ullam impedit enim molestiae explicabo facere voluptates eaque maiores? Adipisci sequi reiciendis modi praesentium amet perspiciatis voluptas, accusantium, quasi ullam maiores suscipit eaque odio sunt laborum velit et. Aspernatur quod suscipit sit unde quia consectetur odio dolorem laudantium reprehenderit. Pariatur, similique magnam perferendis officia eum debitis. Vel temporibus ipsum iste architecto ducimus sequi, ratione, distinctio similique quia voluptatem excepturi quaerat maiores officiis accusantium at eveniet? Id, iusto magnam perspiciatis ad ratione voluptatibus accusantium accusamus, neque eos cum voluptatum deserunt eaque enim assumenda saepe minus sint at, soluta vero debitis omnis error? Ratione velit a qui dicta quibusdam, fugit eligendi alias obcaecati ullam similique nemo unde nesciunt optio, error, ut est esse hic illum vitae? Numquam, explicabo repudiandae, inventore fuga voluptate similique distinctio eveniet quod libero quam possimus nesciunt! Sit consequuntur laborum ad hic voluptates. Voluptates exercitationem eaque, saepe, autem perspiciatis quidem sunt natus aliquid totam, deleniti earum soluta error ipsum perferendis aliquam dolor! Inventore soluta illum ipsum debitis temporibus mollitia sunt quaerat nam! Neque molestias, accusamus placeat debitis nemo non tenetur illum quam eveniet nam repellat ea voluptas eaque modi harum praesentium qui! Tempore fugit exercitationem sapiente temporibus expedita nostrum reprehenderit error consectetur eum animi quia dolor rerum natus illo, qui ipsum aliquam eius. Excepturi inventore a magni quia rem veritatis fugiat reiciendis quis culpa fugit cupiditate reprehenderit nihil, veniam nulla iure cum tempore maxime placeat. Minima iusto tempore assumenda optio fugit, nihil omnis. Optio ex architecto perspiciatis nemo ducimus neque incidunt nisi accusantium in facere facilis voluptas expedita fuga perferendis obcaecati dolores iure illum repudiandae consectetur voluptatem accusamus dolorum harum, eligendi blanditiis? Facere, labore nihil quas fuga deserunt, ab provident consectetur nemo, hic aspernatur in fugiat iure distinctio quia nulla.
            </p>
        </div>
    )
}